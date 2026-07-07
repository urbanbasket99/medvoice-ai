from collections.abc import AsyncIterator

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
from app.modules.ai.domain.exceptions import AIProviderNotAvailableError, AICapabilityNotSupportedError
from app.modules.ai.domain.value_objects import Capability, HealthStatus, ProviderId, ProviderStatus


class PlaceholderAIProvider(AIProviderPort):
    """Future provider stub — registered but not yet implemented."""

    def __init__(
        self,
        provider_id: ProviderId,
        display_name: str,
        description: str,
        capabilities: tuple[Capability, ...],
    ) -> None:
        self._provider_id = provider_id
        self._display_name = display_name
        self._description = description
        self._capabilities = capabilities

    @property
    def provider_id(self) -> ProviderId:
        return self._provider_id

    def describe(self) -> ProviderInfo:
        return ProviderInfo(
            id=self._provider_id,
            name=self._display_name,
            status=ProviderStatus.PLACEHOLDER,
            is_configured=False,
            capabilities=self._capabilities,
            description=self._description,
        )

    def _raise_unavailable(self) -> None:
        raise AIProviderNotAvailableError(
            f"Provider '{self._provider_id.value}' is registered for future use but not yet available."
        )

    async def health_check(self) -> ProviderHealth:
        return ProviderHealth(
            provider_id=self._provider_id,
            status=HealthStatus.NOT_CONFIGURED,
            message="Provider placeholder — integration pending.",
        )

    async def list_models(self) -> list[ModelInfo]:
        self._raise_unavailable()

    async def text_completion(self, request: TextCompletionRequest) -> TextCompletionResult:
        self._raise_unavailable()

    async def structured_json_response(self, request: StructuredJsonRequest) -> StructuredJsonResult:
        self._raise_unavailable()

    async def streaming_response(self, request: TextCompletionRequest) -> AsyncIterator[str]:
        self._raise_unavailable()
        yield ""  # pragma: no cover

    async def speech_to_text(self, request: SpeechToTextRequest) -> SpeechToTextResult:
        self._raise_unavailable()
