from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.radiology.domain.value_objects import (
    RadiologyOrderListCriteria,
    RadiologyOrderSortField,
    RadiologyStatus,
    SortDirection,
)
from app.modules.radiology.presentation.dependencies import (
    CreateRadiologyOrderUseCaseDep,
    DeleteRadiologyOrderUseCaseDep,
    GetRadiologyOrderPrintUseCaseDep,
    GetRadiologyOrderUseCaseDep,
    GetRadiologyOrdersUseCaseDep,
    RequireRadiologyCreate,
    RequireRadiologyDelete,
    RequireRadiologyRead,
    RequireRadiologyUpdate,
    SearchRadiologyOrdersUseCaseDep,
    UpdateRadiologyOrderStatusUseCaseDep,
    UpdateRadiologyOrderUseCaseDep,
)
from app.modules.radiology.presentation.schemas import (
    RadiologyOrderCreateRequest,
    RadiologyOrderListResponse,
    RadiologyOrderPrintResponse,
    RadiologyOrderResponse,
    RadiologyOrderStatusUpdateRequest,
    RadiologyOrderUpdateRequest,
)

router = APIRouter(prefix="/radiology-orders", tags=["radiology"])


@router.get("", response_model=RadiologyOrderListResponse)
async def list_radiology_orders(
    _: RequireRadiologyRead,
    use_case: GetRadiologyOrdersUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: RadiologyOrderSortField = RadiologyOrderSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    status: RadiologyStatus | None = None,
) -> RadiologyOrderListResponse:
    criteria = RadiologyOrderListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        consultation_id=consultation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        status=status,
    )
    result = await use_case.execute(criteria)
    return RadiologyOrderListResponse.from_page(result)


@router.get("/search", response_model=RadiologyOrderListResponse)
async def search_radiology_orders(
    _: RequireRadiologyRead,
    use_case: SearchRadiologyOrdersUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> RadiologyOrderListResponse:
    result = await use_case.execute(q, page, page_size)
    return RadiologyOrderListResponse.from_page(result)


@router.get("/{radiology_order_id}/print", response_model=RadiologyOrderPrintResponse)
async def print_radiology_order(
    radiology_order_id: UUID,
    _: RequireRadiologyRead,
    use_case: GetRadiologyOrderPrintUseCaseDep,
) -> RadiologyOrderPrintResponse:
    output = await use_case.execute(radiology_order_id)
    return RadiologyOrderPrintResponse.from_output(output)


@router.get("/{radiology_order_id}", response_model=RadiologyOrderResponse)
async def get_radiology_order(
    radiology_order_id: UUID,
    _: RequireRadiologyRead,
    use_case: GetRadiologyOrderUseCaseDep,
) -> RadiologyOrderResponse:
    radiology_order = await use_case.execute(radiology_order_id)
    return RadiologyOrderResponse.from_entity(radiology_order)


@router.post("", response_model=RadiologyOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_radiology_order(
    payload: RadiologyOrderCreateRequest,
    _: RequireRadiologyCreate,
    use_case: CreateRadiologyOrderUseCaseDep,
) -> RadiologyOrderResponse:
    radiology_order = await use_case.execute(payload.to_input())
    return RadiologyOrderResponse.from_entity(radiology_order)


@router.put("/{radiology_order_id}", response_model=RadiologyOrderResponse)
async def update_radiology_order(
    radiology_order_id: UUID,
    payload: RadiologyOrderUpdateRequest,
    _: RequireRadiologyUpdate,
    use_case: UpdateRadiologyOrderUseCaseDep,
) -> RadiologyOrderResponse:
    radiology_order = await use_case.execute(radiology_order_id, payload.to_input())
    return RadiologyOrderResponse.from_entity(radiology_order)


@router.patch("/{radiology_order_id}/status", response_model=RadiologyOrderResponse)
async def update_radiology_order_status(
    radiology_order_id: UUID,
    payload: RadiologyOrderStatusUpdateRequest,
    _: RequireRadiologyUpdate,
    use_case: UpdateRadiologyOrderStatusUseCaseDep,
) -> RadiologyOrderResponse:
    radiology_order = await use_case.execute(radiology_order_id, payload.to_input())
    return RadiologyOrderResponse.from_entity(radiology_order)


@router.delete("/{radiology_order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_radiology_order(
    radiology_order_id: UUID,
    _: RequireRadiologyDelete,
    use_case: DeleteRadiologyOrderUseCaseDep,
) -> None:
    await use_case.execute(radiology_order_id)
