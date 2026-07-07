import json
import time
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import httpx

from app.core.config import get_settings
from app.modules.ai.application.interfaces.ai_provider_port import AIProviderPort
from app.modules.ai.domain.entities.ai_entities import (
    ModelInfo,
    ProviderHealth,
    ProviderInfo,
    SpeechToTextRequest,
    SpeechToTextResult,
    StructuredJsonRequest,
    StructuredJsonResult,
    TextCompletionRequest,
    TextCompletionResult,
)
from app.modules.ai.domain.exceptions import (
    AICapabilityNotSupportedError,
    AIProviderConfigurationError,
    AIProviderRequestError,
)
from app.modules.ai.domain.value_objects import Capability, HealthStatus, ProviderId, ProviderStatus


class OpenAIProvider(AIProviderPort):
    """Production OpenAI adapter for text capabilities."""

    BASE_URL = "https://api.openai.com/v1"

    @property
    def provider_id(self) -> ProviderId:
        return ProviderId.OPENAI

    def describe(self) -> ProviderInfo:
        settings = get_settings()
        configured = bool(settings.openai_api_key)
        return ProviderInfo(
            id=ProviderId.OPENAI,
            name="OpenAI",
            status=ProviderStatus.ACTIVE if configured else ProviderStatus.UNAVAILABLE,
            is_configured=configured,
            capabilities=(
                Capability.TEXT_COMPLETION,
                Capability.STRUCTURED_JSON,
                Capability.STREAMING,
                Capability.HEALTH_CHECK,
                Capability.SPEECH_TO_TEXT,
            ),
            description="OpenAI chat completions (Whisper reserved for future release).",
        )

    def _api_key(self) -> str:
        settings = get_settings()
        if not settings.openai_api_key:
            raise AIProviderConfigurationError("OPENAI_API_KEY is not configured.")
        return settings.openai_api_key

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key()}",
            "Content-Type": "application/json",
        }

    async def health_check(self) -> ProviderHealth:
        settings = get_settings()
        if not settings.openai_api_key:
            return ProviderHealth(
                provider_id=self.provider_id,
                status=HealthStatus.NOT_CONFIGURED,
                message="OPENAI_API_KEY is not set.",
            )

        started = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{self.BASE_URL}/models", headers=self._headers())
                latency_ms = (time.perf_counter() - started) * 1000
                if response.status_code == 200:
                    return ProviderHealth(
                        provider_id=self.provider_id,
                        status=HealthStatus.HEALTHY,
                        message="OpenAI API reachable.",
                        latency_ms=round(latency_ms, 2),
                    )
                return ProviderHealth(
                    provider_id=self.provider_id,
                    status=HealthStatus.UNHEALTHY,
                    message=f"OpenAI API returned HTTP {response.status_code}.",
                    latency_ms=round(latency_ms, 2),
                )
        except httpx.HTTPError as exc:
            return ProviderHealth(
                provider_id=self.provider_id,
                status=HealthStatus.UNHEALTHY,
                message=f"OpenAI health check failed: {exc}",
            )

    async def list_models(self) -> list[ModelInfo]:
        settings = get_settings()
        default_model = settings.openai_model
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(f"{self.BASE_URL}/models", headers=self._headers())
                if response.status_code != 200:
                    raise AIProviderRequestError(f"Failed to list OpenAI models (HTTP {response.status_code}).")
                payload = response.json()
        except httpx.HTTPError as exc:
            raise AIProviderRequestError(f"OpenAI models request failed: {exc}") from exc

        models: list[ModelInfo] = []
        for item in payload.get("data", []):
            model_id = item.get("id")
            if not isinstance(model_id, str):
                continue
            if not any(model_id.startswith(prefix) for prefix in ("gpt-", "o1", "o3", "o4")):
                continue
            models.append(
                ModelInfo(
                    id=model_id,
                    name=model_id,
                    description="OpenAI chat model",
                    is_default=model_id == default_model,
                )
            )

        models.sort(key=lambda model: (not model.is_default, model.id))
        if not models:
            models.append(ModelInfo(id=default_model, name=default_model, is_default=True))
        return models

    async def text_completion(self, request: TextCompletionRequest) -> TextCompletionResult:
        settings = get_settings()
        body = {
            "model": request.model or settings.openai_model,
            "messages": self._build_messages(request),
            "temperature": request.temperature if request.temperature is not None else settings.temperature,
            "max_tokens": request.max_tokens if request.max_tokens is not None else settings.max_tokens,
        }
        payload = await self._post_json("/chat/completions", body)
        return self._parse_completion(payload)

    async def structured_json_response(self, request: StructuredJsonRequest) -> StructuredJsonResult:
        settings = get_settings()
        body = {
            "model": request.model or settings.openai_model,
            "messages": [
                {"role": "system", "content": "Respond with valid JSON only."},
                {
                    "role": "user",
                    "content": request.prompt
                    if not request.json_schema_hint
                    else f"{request.prompt}\n\nSchema hint:\n{request.json_schema_hint}",
                },
            ],
            "temperature": request.temperature if request.temperature is not None else settings.temperature,
            "max_tokens": request.max_tokens if request.max_tokens is not None else settings.max_tokens,
            "response_format": {"type": "json_object"},
        }
        payload = await self._post_json("/chat/completions", body)
        completion = self._parse_completion(payload)
        try:
            data = json.loads(completion.text)
        except json.JSONDecodeError as exc:
            raise AIProviderRequestError("OpenAI returned non-JSON content for structured response.") from exc
        if not isinstance(data, dict):
            raise AIProviderRequestError("Structured response must be a JSON object.")
        return StructuredJsonResult(
            data=data,
            model=completion.model,
            provider_id=self.provider_id,
            raw_text=completion.text,
        )

    async def streaming_response(self, request: TextCompletionRequest) -> AsyncIterator[str]:
        settings = get_settings()
        body = {
            "model": request.model or settings.openai_model,
            "messages": self._build_messages(request),
            "temperature": request.temperature if request.temperature is not None else settings.temperature,
            "max_tokens": request.max_tokens if request.max_tokens is not None else settings.max_tokens,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{self.BASE_URL}/chat/completions",
                headers=self._headers(),
                json=body,
            ) as response:
                if response.status_code != 200:
                    detail = await response.aread()
                    raise AIProviderRequestError(
                        f"OpenAI streaming request failed (HTTP {response.status_code}): {detail.decode()}"
                    )
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data = line.removeprefix("data: ").strip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                    if delta:
                        yield str(delta)

    async def speech_to_text(self, request: SpeechToTextRequest) -> SpeechToTextResult:
        settings = get_settings()
        if not request.file_path and not request.audio_bytes:
            raise AIProviderConfigurationError("Audio content is required for speech-to-text.")

        if request.file_path:
            path = Path(request.file_path)
            if not path.is_file():
                raise AIProviderConfigurationError(f"Audio file not found: {request.file_path}")
            audio_bytes = path.read_bytes()
            file_name = request.file_name or path.name
        else:
            audio_bytes = request.audio_bytes or b""
            file_name = request.file_name or "audio.webm"

        model = request.model or settings.whisper_model
        mime_type = request.audio_format or "audio/webm"

        form_data: dict[str, str] = {"model": model, "response_format": "verbose_json"}
        if request.language:
            form_data["language"] = request.language

        files = {"file": (file_name, audio_bytes, mime_type)}

        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}/audio/transcriptions",
                    headers={"Authorization": f"Bearer {self._api_key()}"},
                    files=files,
                    data=form_data,
                )
        except httpx.HTTPError as exc:
            raise AIProviderRequestError(f"OpenAI Whisper request failed: {exc}") from exc

        if response.status_code != 200:
            raise AIProviderRequestError(
                f"OpenAI Whisper request failed (HTTP {response.status_code}): {response.text}"
            )

        payload = response.json()
        if not isinstance(payload, dict):
            raise AIProviderRequestError("OpenAI Whisper returned an unexpected response payload.")

        text = str(payload.get("text") or "").strip()
        duration = payload.get("duration")
        raw_segments = payload.get("segments") or []
        segments: list[dict] = []
        if isinstance(raw_segments, list):
            for index, segment in enumerate(raw_segments):
                if not isinstance(segment, dict):
                    continue
                avg_logprob = segment.get("avg_logprob")
                confidence = None
                if isinstance(avg_logprob, (int, float)):
                    confidence = round(min(1.0, max(0.0, pow(2.718281828, avg_logprob))), 4)
                segments.append(
                    {
                        "index": index,
                        "start_seconds": segment.get("start"),
                        "end_seconds": segment.get("end"),
                        "text": segment.get("text"),
                        "speaker_label": "Speaker 1",
                        "confidence": confidence,
                    }
                )

        return SpeechToTextResult(
            text=text,
            model=str(payload.get("model") or model),
            provider_id=self.provider_id,
            duration_seconds=float(duration) if duration is not None else None,
            segments=tuple(segments),
        )

    async def _post_json(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}{path}",
                    headers=self._headers(),
                    json=body,
                )
        except httpx.HTTPError as exc:
            raise AIProviderRequestError(f"OpenAI request failed: {exc}") from exc

        if response.status_code != 200:
            raise AIProviderRequestError(
                f"OpenAI request failed (HTTP {response.status_code}): {response.text}"
            )
        payload = response.json()
        if not isinstance(payload, dict):
            raise AIProviderRequestError("OpenAI returned an unexpected response payload.")
        return payload

    @staticmethod
    def _build_messages(request: TextCompletionRequest) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})
        return messages

    def _parse_completion(self, payload: dict[str, Any]) -> TextCompletionResult:
        choices = payload.get("choices") or []
        message = choices[0].get("message", {}) if choices else {}
        content = message.get("content")
        if not isinstance(content, str):
            raise AIProviderRequestError("OpenAI completion did not include text content.")
        usage = payload.get("usage") or {}
        return TextCompletionResult(
            text=content.strip(),
            model=str(payload.get("model") or get_settings().openai_model),
            provider_id=self.provider_id,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
            total_tokens=usage.get("total_tokens"),
        )
