from typing import Annotated

from fastapi import Depends

from app.api.deps import require_permission
from app.domain.entities.user import User
from app.modules.ai.application.interfaces.ai_provider_registry_port import AIProviderRegistryPort
from app.modules.ai.application.interfaces.ai_settings_repository import AiSettingsRepository
from app.modules.ai.application.use_cases.get_models import GetModelsUseCase
from app.modules.ai.application.use_cases.get_providers import GetProvidersUseCase
from app.modules.ai.application.use_cases.health_check import HealthCheckUseCase
from app.modules.ai.application.use_cases.manage_settings import GetAiSettingsUseCase, UpdateAiSettingsUseCase
from app.modules.ai.application.use_cases.test_ai import TestAiUseCase
from app.modules.ai.infrastructure.provider_registry import ProviderRegistry
from app.modules.ai.infrastructure.settings.json_file_ai_settings_repository import JsonFileAiSettingsRepository


def get_provider_registry() -> AIProviderRegistryPort:
    return ProviderRegistry()


def get_ai_settings_repository() -> AiSettingsRepository:
    return JsonFileAiSettingsRepository()


ProviderRegistryDep = Annotated[AIProviderRegistryPort, Depends(get_provider_registry)]
AiSettingsRepositoryDep = Annotated[AiSettingsRepository, Depends(get_ai_settings_repository)]


def provide_get_providers_use_case(
    registry: ProviderRegistryDep,
    settings_repository: AiSettingsRepositoryDep,
) -> GetProvidersUseCase:
    return GetProvidersUseCase(registry, settings_repository)


def provide_get_models_use_case(
    registry: ProviderRegistryDep,
    settings_repository: AiSettingsRepositoryDep,
) -> GetModelsUseCase:
    return GetModelsUseCase(registry, settings_repository)


def provide_health_check_use_case(
    registry: ProviderRegistryDep,
    settings_repository: AiSettingsRepositoryDep,
) -> HealthCheckUseCase:
    return HealthCheckUseCase(registry, settings_repository)


def provide_test_ai_use_case(
    registry: ProviderRegistryDep,
    settings_repository: AiSettingsRepositoryDep,
) -> TestAiUseCase:
    return TestAiUseCase(registry, settings_repository)


def provide_get_ai_settings_use_case(
    settings_repository: AiSettingsRepositoryDep,
) -> GetAiSettingsUseCase:
    return GetAiSettingsUseCase(settings_repository)


def provide_update_ai_settings_use_case(
    settings_repository: AiSettingsRepositoryDep,
) -> UpdateAiSettingsUseCase:
    return UpdateAiSettingsUseCase(settings_repository)


GetProvidersUseCaseDep = Annotated[GetProvidersUseCase, Depends(provide_get_providers_use_case)]
GetModelsUseCaseDep = Annotated[GetModelsUseCase, Depends(provide_get_models_use_case)]
HealthCheckUseCaseDep = Annotated[HealthCheckUseCase, Depends(provide_health_check_use_case)]
TestAiUseCaseDep = Annotated[TestAiUseCase, Depends(provide_test_ai_use_case)]
GetAiSettingsUseCaseDep = Annotated[GetAiSettingsUseCase, Depends(provide_get_ai_settings_use_case)]
UpdateAiSettingsUseCaseDep = Annotated[UpdateAiSettingsUseCase, Depends(provide_update_ai_settings_use_case)]

RequireAiRead = Annotated[User, Depends(require_permission("ai:read"))]
RequireAiUpdate = Annotated[User, Depends(require_permission("ai:update"))]
RequireAiTest = Annotated[User, Depends(require_permission("ai:test"))]
