from dataclasses import dataclass

from app.modules.ai.domain.entities.ai_entities import (
    AiRuntimeSettings,
    ProviderInfo,
    StructuredJsonRequest,
    TextCompletionRequest,
)
from app.modules.ai.domain.value_objects import ProviderId


@dataclass(frozen=True, slots=True)
class UpdateAiSettingsInput:
    active_provider: ProviderId | None = None
    model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None


@dataclass(frozen=True, slots=True)
class TestAiInput:
    prompt: str
    provider_id: ProviderId | None = None
    model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None


@dataclass(frozen=True, slots=True)
class ProvidersCatalog:
    providers: list[ProviderInfo]
    settings: AiRuntimeSettings
