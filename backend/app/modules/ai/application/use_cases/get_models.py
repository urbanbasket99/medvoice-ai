from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.domain.entities.ai_entities import ModelInfo
from app.modules.ai.domain.exceptions import AIProviderNotFoundError
from app.modules.ai.domain.value_objects import ProviderId
from app.modules.ai.application.interfaces.ai_provider_registry_port import AIProviderRegistryPort


class GetModelsUseCase:
    def __init__(
        self,
        registry: AIProviderRegistryPort,
        settings_repository: AiSettingsRepository,
    ) -> None:
        self._registry = registry
        self._settings = settings_repository

    async def execute(self, provider_id: ProviderId | None = None) -> list[ModelInfo]:
        settings = await self._settings.get()
        resolved = provider_id or settings.active_provider
        provider = self._registry.get(resolved)
        if provider is None:
            raise AIProviderNotFoundError(f"Provider '{resolved}' is not registered.")
        return await provider.list_models()
