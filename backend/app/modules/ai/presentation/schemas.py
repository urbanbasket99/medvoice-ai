from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.ai.application.dto.ai_dto import ProvidersCatalog, TestAiInput, UpdateAiSettingsInput
from app.modules.ai.domain.entities.ai_entities import (
    AiRuntimeSettings,
    ModelInfo,
    ProviderHealth,
    ProviderInfo,
    TextCompletionResult,
)
from app.modules.ai.domain.value_objects import Capability, HealthStatus, ProviderId, ProviderStatus


class ProviderResponse(BaseModel):
    id: ProviderId
    name: str
    status: ProviderStatus
    is_configured: bool
    capabilities: list[Capability]
    description: str | None = None

    @classmethod
    def from_entity(cls, provider: ProviderInfo) -> "ProviderResponse":
        return cls(
            id=provider.id,
            name=provider.name,
            status=provider.status,
            is_configured=provider.is_configured,
            capabilities=list(provider.capabilities),
            description=provider.description,
        )


class AiSettingsResponse(BaseModel):
    active_provider: ProviderId
    model: str
    whisper_model: str
    temperature: float
    max_tokens: int
    api_key_configured: bool

    @classmethod
    def from_entity(cls, settings: AiRuntimeSettings) -> "AiSettingsResponse":
        return cls(
            active_provider=settings.active_provider,
            model=settings.model,
            whisper_model=settings.whisper_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            api_key_configured=settings.api_key_configured,
        )


class ProvidersCatalogResponse(BaseModel):
    providers: list[ProviderResponse]
    settings: AiSettingsResponse

    @classmethod
    def from_catalog(cls, catalog: ProvidersCatalog) -> "ProvidersCatalogResponse":
        return cls(
            providers=[ProviderResponse.from_entity(item) for item in catalog.providers],
            settings=AiSettingsResponse.from_entity(catalog.settings),
        )


class ModelResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_default: bool = False

    @classmethod
    def from_entity(cls, model: ModelInfo) -> "ModelResponse":
        return cls(
            id=model.id,
            name=model.name,
            description=model.description,
            is_default=model.is_default,
        )


class ModelsListResponse(BaseModel):
    items: list[ModelResponse]

    @classmethod
    def from_entities(cls, models: list[ModelInfo]) -> "ModelsListResponse":
        return cls(items=[ModelResponse.from_entity(model) for model in models])


class HealthResponse(BaseModel):
    provider_id: ProviderId
    status: HealthStatus
    message: str
    latency_ms: float | None = None
    checked_at: datetime

    @classmethod
    def from_entity(cls, health: ProviderHealth) -> "HealthResponse":
        return cls(
            provider_id=health.provider_id,
            status=health.status,
            message=health.message,
            latency_ms=health.latency_ms,
            checked_at=health.checked_at,
        )


class UpdateAiSettingsRequest(BaseModel):
    active_provider: ProviderId | None = None
    model: str | None = Field(default=None, min_length=1, max_length=128)
    temperature: float | None = Field(default=None, ge=0, le=2)
    max_tokens: int | None = Field(default=None, ge=1, le=128000)

    def to_input(self) -> UpdateAiSettingsInput:
        return UpdateAiSettingsInput(
            active_provider=self.active_provider,
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )


class TestAiRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    provider_id: ProviderId | None = None
    model: str | None = Field(default=None, min_length=1, max_length=128)
    temperature: float | None = Field(default=None, ge=0, le=2)
    max_tokens: int | None = Field(default=None, ge=1, le=128000)

    def to_input(self) -> TestAiInput:
        return TestAiInput(
            prompt=self.prompt,
            provider_id=self.provider_id,
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )


class TestAiResponse(BaseModel):
    text: str
    model: str
    provider_id: ProviderId
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None

    @classmethod
    def from_result(cls, result: TextCompletionResult) -> "TestAiResponse":
        return cls(
            text=result.text,
            model=result.model,
            provider_id=result.provider_id,
            prompt_tokens=result.prompt_tokens,
            completion_tokens=result.completion_tokens,
            total_tokens=result.total_tokens,
        )
