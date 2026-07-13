from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.billing.presentation.dependencies import (
    CreateTpaUseCaseDep,
    GetTpaUseCaseDep,
    ListTpasUseCaseDep,
    RequireBillingCreate,
    RequireBillingRead,
    RequireBillingUpdate,
    UpdateTpaUseCaseDep,
)
from app.modules.billing.presentation.schemas import (
    TpaCreateRequest,
    TpaResponse,
    TpaUpdateRequest,
)

router = APIRouter(prefix="/billing/tpas", tags=["billing"])


@router.get("", response_model=list[TpaResponse])
async def list_tpas(
    _: RequireBillingRead,
    use_case: ListTpasUseCaseDep,
    active_only: Annotated[bool, Query()] = False,
) -> list[TpaResponse]:
    tpas = await use_case.execute(active_only=active_only)
    return [TpaResponse.from_entity(t) for t in tpas]


@router.post("", response_model=TpaResponse, status_code=status.HTTP_201_CREATED)
async def create_tpa(
    payload: TpaCreateRequest,
    _: RequireBillingCreate,
    use_case: CreateTpaUseCaseDep,
) -> TpaResponse:
    tpa = await use_case.execute(payload.to_input())
    return TpaResponse.from_entity(tpa)


@router.get("/{tpa_id}", response_model=TpaResponse)
async def get_tpa(
    tpa_id: UUID,
    _: RequireBillingRead,
    use_case: GetTpaUseCaseDep,
) -> TpaResponse:
    tpa = await use_case.execute(tpa_id)
    return TpaResponse.from_entity(tpa)


@router.put("/{tpa_id}", response_model=TpaResponse)
async def update_tpa(
    tpa_id: UUID,
    payload: TpaUpdateRequest,
    _: RequireBillingUpdate,
    use_case: UpdateTpaUseCaseDep,
) -> TpaResponse:
    tpa = await use_case.execute(tpa_id, payload.to_input())
    return TpaResponse.from_entity(tpa)
