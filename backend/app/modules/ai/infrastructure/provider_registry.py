from app.modules.ai.application.interfaces.ai_provider_port import AIProviderPort
from app.modules.ai.application.interfaces.ai_provider_registry_port import AIProviderRegistryPort
from app.modules.ai.domain.exceptions import AIProviderNotFoundError
from app.modules.ai.domain.value_objects import ProviderId
from app.modules.ai.infrastructure.providers.openai_provider import OpenAIProvider
from app.modules.ai.infrastructure.providers.azure_openai_provider import AzureOpenAIProvider
from app.modules.ai.infrastructure.providers.gemini_provider import GeminiProvider
from app.modules.ai.infrastructure.providers.claude_provider import ClaudeProvider
from app.modules.ai.infrastructure.providers.local_llm_provider import LocalLLMProvider


class ProviderRegistry(AIProviderRegistryPort):
    """Central registry for all AI provider adapters."""

    def __init__(self) -> None:
        self._providers: dict[ProviderId, AIProviderPort] = {
            ProviderId.OPENAI: OpenAIProvider(),
            ProviderId.AZURE_OPENAI: AzureOpenAIProvider(),
            ProviderId.GEMINI: GeminiProvider(),
            ProviderId.CLAUDE: ClaudeProvider(),
            ProviderId.LOCAL_LLM: LocalLLMProvider(),
        }

    def all(self) -> list[AIProviderPort]:
        return list(self._providers.values())

    def get(self, provider_id: ProviderId) -> AIProviderPort | None:
        return self._providers.get(provider_id)

    def require(self, provider_id: ProviderId) -> AIProviderPort:
        provider = self.get(provider_id)
        if provider is None:
            raise AIProviderNotFoundError(f"Provider '{provider_id.value}' is not registered.")
        return provider
