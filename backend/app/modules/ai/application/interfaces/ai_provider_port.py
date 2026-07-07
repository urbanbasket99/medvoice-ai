from abc import ABC, abstractmethod
from collections.abc import AsyncIterator

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
from app.modules.ai.domain.value_objects import ProviderId


class AIProviderPort(ABC):
    """Contract every AI provider adapter must implement."""

    @property
    @abstractmethod
    def provider_id(self) -> ProviderId:
        """Stable provider identifier."""

    @abstractmethod
    def describe(self) -> ProviderInfo:
        """Metadata for provider catalog responses."""

    @abstractmethod
    async def health_check(self) -> ProviderHealth:
        """Verify connectivity and credentials."""

    @abstractmethod
    async def list_models(self) -> list[ModelInfo]:
        """Return models supported by this provider."""

    @abstractmethod
    async def text_completion(self, request: TextCompletionRequest) -> TextCompletionResult:
        """Generate a plain-text completion."""

    @abstractmethod
    async def structured_json_response(self, request: StructuredJsonRequest) -> StructuredJsonResult:
        """Generate a JSON object response."""

    @abstractmethod
    async def streaming_response(self, request: TextCompletionRequest) -> AsyncIterator[str]:
        """Stream completion tokens."""

    @abstractmethod
    async def speech_to_text(self, request: SpeechToTextRequest) -> SpeechToTextResult:
        """Convert audio to text (reserved — not enabled in current release)."""
