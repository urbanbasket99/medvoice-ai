from dataclasses import dataclass, field
from datetime import UTC, datetime

from app.modules.ai.domain.value_objects import Capability, HealthStatus, ProviderId, ProviderStatus


@dataclass(frozen=True, slots=True)
class ModelInfo:
    id: str
    name: str
    description: str | None = None
    is_default: bool = False


@dataclass(frozen=True, slots=True)
class ProviderInfo:
    id: ProviderId
    name: str
    status: ProviderStatus
    is_configured: bool
    capabilities: tuple[Capability, ...]
    description: str | None = None


@dataclass(frozen=True, slots=True)
class ProviderHealth:
    provider_id: ProviderId
    status: HealthStatus
    message: str
    latency_ms: float | None = None
    checked_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(frozen=True, slots=True)
class TextCompletionRequest:
    prompt: str
    model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    system_prompt: str | None = None


@dataclass(frozen=True, slots=True)
class TextCompletionResult:
    text: str
    model: str
    provider_id: ProviderId
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None


@dataclass(frozen=True, slots=True)
class StructuredJsonRequest:
    prompt: str
    json_schema_hint: str | None = None
    model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None


@dataclass(frozen=True, slots=True)
class StructuredJsonResult:
    data: dict
    model: str
    provider_id: ProviderId
    raw_text: str | None = None


@dataclass(frozen=True, slots=True)
class SpeechToTextRequest:
    file_path: str | None = None
    audio_bytes: bytes | None = None
    file_name: str | None = None
    audio_format: str | None = None
    language: str | None = None
    model: str | None = None


@dataclass(frozen=True, slots=True)
class SpeechToTextResult:
    text: str
    model: str
    provider_id: ProviderId
    duration_seconds: float | None = None
    segments: tuple[dict, ...] = ()


@dataclass(frozen=True, slots=True)
class AiRuntimeSettings:
    active_provider: ProviderId
    model: str
    whisper_model: str
    temperature: float
    max_tokens: int
    api_key_configured: bool
