from app.modules.ai.application.dto.ai_dto import TestAiInput
from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.domain.entities.ai_entities import TextCompletionRequest, TextCompletionResult
from app.modules.ai.domain.exceptions import AIProviderNotFoundError
from app.modules.ai.application.interfaces.ai_provider_registry_port import AIProviderRegistryPort


class TestAiUseCase:
    def __init__(
        self,
        registry: AIProviderRegistryPort,
        settings_repository: AiSettingsRepository,
    ) -> None:
        self._registry = registry
        self._settings = settings_repository

    async def execute(self, data: TestAiInput) -> TextCompletionResult:
        settings = await self._settings.get()
        provider_id = data.provider_id or settings.active_provider
        provider = self._registry.get(provider_id)
        if provider is None:
            raise AIProviderNotFoundError(f"Provider '{provider_id}' is not registered.")

        request = TextCompletionRequest(
            prompt=data.prompt,
            model=data.model or settings.model,
            temperature=data.temperature if data.temperature is not None else settings.temperature,
            max_tokens=data.max_tokens if data.max_tokens is not None else settings.max_tokens,
            system_prompt="You are a helpful assistant for MedVoice AI HMS.",
        )
        return await provider.text_completion(request)
