from typing import Annotated

from fastapi import APIRouter, Query
from app.modules.ai.domain.value_objects import ProviderId
from app.modules.ai.presentation.dependencies import (
    GetAiSettingsUseCaseDep,
    GetModelsUseCaseDep,
    GetProvidersUseCaseDep,
    HealthCheckUseCaseDep,
    RequireAiRead,
    RequireAiTest,
    RequireAiUpdate,
    TestAiUseCaseDep,
    UpdateAiSettingsUseCaseDep,
)
from app.modules.ai.presentation.schemas import (
    AiSettingsResponse,
    HealthResponse,
    ModelsListResponse,
    ProvidersCatalogResponse,
    TestAiRequest,
    TestAiResponse,
    UpdateAiSettingsRequest,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/providers", response_model=ProvidersCatalogResponse)
async def list_providers(
    _: RequireAiRead,
    use_case: GetProvidersUseCaseDep,
) -> ProvidersCatalogResponse:
    catalog = await use_case.execute()
    return ProvidersCatalogResponse.from_catalog(catalog)


@router.get("/models", response_model=ModelsListResponse)
async def list_models(
    _: RequireAiRead,
    use_case: GetModelsUseCaseDep,
    provider_id: Annotated[ProviderId | None, Query(alias="provider_id")] = None,
) -> ModelsListResponse:
    models = await use_case.execute(provider_id)
    return ModelsListResponse.from_entities(models)


@router.get("/health", response_model=HealthResponse)
async def provider_health(
    _: RequireAiRead,
    use_case: HealthCheckUseCaseDep,
    provider_id: Annotated[ProviderId | None, Query(alias="provider_id")] = None,
) -> HealthResponse:
    health = await use_case.execute(provider_id)
    return HealthResponse.from_entity(health)


@router.get("/settings", response_model=AiSettingsResponse)
async def get_settings(
    _: RequireAiRead,
    use_case: GetAiSettingsUseCaseDep,
) -> AiSettingsResponse:
    settings = await use_case.execute()
    return AiSettingsResponse.from_entity(settings)


@router.put("/settings", response_model=AiSettingsResponse)
async def update_settings(
    payload: UpdateAiSettingsRequest,
    _: RequireAiUpdate,
    use_case: UpdateAiSettingsUseCaseDep,
) -> AiSettingsResponse:
    settings = await use_case.execute(payload.to_input())
    return AiSettingsResponse.from_entity(settings)


@router.post("/test", response_model=TestAiResponse)
async def test_ai(
    payload: TestAiRequest,
    _: RequireAiTest,
    use_case: TestAiUseCaseDep,
) -> TestAiResponse:
    result = await use_case.execute(payload.to_input())
    return TestAiResponse.from_result(result)
