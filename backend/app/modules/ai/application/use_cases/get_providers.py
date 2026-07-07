from app.modules.ai.application.interfaces.ai_provider_port import AIProviderPort
from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.application.dto.ai_dto import ProvidersCatalog
from app.modules.ai.application.interfaces.ai_provider_registry_port import AIProviderRegistryPort


class GetProvidersUseCase:
    def __init__(
        self,
        registry: AIProviderRegistryPort,
        settings_repository: AiSettingsRepository,
    ) -> None:
        self._registry = registry
        self._settings = settings_repository

    async def execute(self) -> ProvidersCatalog:
        settings = await self._settings.get()
        providers = [provider.describe() for provider in self._registry.all()]
        return ProvidersCatalog(providers=providers, settings=settings)
