import json
from pathlib import Path

from app.core.config import get_settings
from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.domain.entities.ai_entities import AiRuntimeSettings
from app.modules.ai.domain.value_objects import ProviderId


class JsonFileAiSettingsRepository(AiSettingsRepository):
    """Persists operator preferences to a JSON file with environment defaults."""

    def __init__(self, path: Path | None = None) -> None:
        settings = get_settings()
        self._path = path or Path(settings.ai_settings_path)
        self._path.parent.mkdir(parents=True, exist_ok=True)

    def _defaults(self) -> AiRuntimeSettings:
        settings = get_settings()
        return AiRuntimeSettings(
            active_provider=ProviderId.OPENAI,
            model=settings.openai_model,
            whisper_model=settings.whisper_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            api_key_configured=bool(settings.openai_api_key),
        )

    def _read_overrides(self) -> dict:
        if not self._path.is_file():
            return {}
        try:
            return json.loads(self._path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}

    async def get(self) -> AiRuntimeSettings:
        defaults = self._defaults()
        overrides = self._read_overrides()
        active_provider = ProviderId(overrides.get("active_provider", defaults.active_provider))
        return AiRuntimeSettings(
            active_provider=active_provider,
            model=str(overrides.get("model", defaults.model)),
            whisper_model=defaults.whisper_model,
            temperature=float(overrides.get("temperature", defaults.temperature)),
            max_tokens=int(overrides.get("max_tokens", defaults.max_tokens)),
            api_key_configured=defaults.api_key_configured,
        )

    async def save(
        self,
        *,
        active_provider: ProviderId | None = None,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AiRuntimeSettings:
        current = await self.get()
        merged = AiRuntimeSettings(
            active_provider=active_provider or current.active_provider,
            model=model or current.model,
            whisper_model=current.whisper_model,
            temperature=temperature if temperature is not None else current.temperature,
            max_tokens=max_tokens if max_tokens is not None else current.max_tokens,
            api_key_configured=current.api_key_configured,
        )
        payload = {
            "active_provider": merged.active_provider.value,
            "model": merged.model,
            "temperature": merged.temperature,
            "max_tokens": merged.max_tokens,
        }
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return merged
