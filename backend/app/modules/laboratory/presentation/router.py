from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.laboratory.domain.value_objects import (
    LabOrderListCriteria,
    LabOrderSortField,
    LabStatus,
    SortDirection,
)
from app.modules.laboratory.presentation.dependencies import (
    CreateLabOrderUseCaseDep,
    DeleteLabOrderUseCaseDep,
    GetLabOrderPrintUseCaseDep,
    GetLabOrderUseCaseDep,
    GetLabOrdersUseCaseDep,
    GetLabResultsPrintUseCaseDep,
    RequireLaboratoryCreate,
    RequireLaboratoryDelete,
    RequireLaboratoryRead,
    RequireLaboratoryUpdate,
    SearchLabOrdersUseCaseDep,
    UpdateLabOrderStatusUseCaseDep,
    UpdateLabOrderUseCaseDep,
    UpdateLabResultsUseCaseDep,
    SendLabResultsEmailUseCaseDep,
)
from app.modules.laboratory.presentation.schemas import (
    LabOrderCreateRequest,
    LabOrderListResponse,
    LabOrderPrintResponse,
    LabOrderResponse,
    LabOrderStatusUpdateRequest,
    LabOrderUpdateRequest,
    LabResultsEmailRequest,
    LabResultsPrintResponse,
    LabResultsUpdateRequest,
    ReportEmailDeliveryResponse,
)

router = APIRouter(prefix="/lab-orders", tags=["laboratory"])


@router.get("", response_model=LabOrderListResponse)
async def list_lab_orders(
    _: RequireLaboratoryRead,
    use_case: GetLabOrdersUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: LabOrderSortField = LabOrderSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    status: LabStatus | None = None,
) -> LabOrderListResponse:
    criteria = LabOrderListCriteria(
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
    return LabOrderListResponse.from_page(result)


@router.get("/search", response_model=LabOrderListResponse)
async def search_lab_orders(
    _: RequireLaboratoryRead,
    use_case: SearchLabOrdersUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> LabOrderListResponse:
    result = await use_case.execute(q, page, page_size)
    return LabOrderListResponse.from_page(result)


@router.get("/{lab_order_id}/print", response_model=LabOrderPrintResponse)
async def print_lab_order(
    lab_order_id: UUID,
    _: RequireLaboratoryRead,
    use_case: GetLabOrderPrintUseCaseDep,
) -> LabOrderPrintResponse:
    output = await use_case.execute(lab_order_id)
    return LabOrderPrintResponse.from_output(output)


@router.get("/{lab_order_id}/results/print", response_model=LabResultsPrintResponse)
async def print_lab_results(
    lab_order_id: UUID,
    _: RequireLaboratoryRead,
    use_case: GetLabResultsPrintUseCaseDep,
) -> LabResultsPrintResponse:
    output = await use_case.execute(lab_order_id)
    return LabResultsPrintResponse.from_output(output)


@router.get("/{lab_order_id}", response_model=LabOrderResponse)
async def get_lab_order(
    lab_order_id: UUID,
    _: RequireLaboratoryRead,
    use_case: GetLabOrderUseCaseDep,
) -> LabOrderResponse:
    lab_order = await use_case.execute(lab_order_id)
    return LabOrderResponse.from_entity(lab_order)


@router.post("", response_model=LabOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_order(
    payload: LabOrderCreateRequest,
    _: RequireLaboratoryCreate,
    use_case: CreateLabOrderUseCaseDep,
) -> LabOrderResponse:
    lab_order = await use_case.execute(payload.to_input())
    return LabOrderResponse.from_entity(lab_order)


@router.put("/{lab_order_id}", response_model=LabOrderResponse)
async def update_lab_order(
    lab_order_id: UUID,
    payload: LabOrderUpdateRequest,
    _: RequireLaboratoryUpdate,
    use_case: UpdateLabOrderUseCaseDep,
) -> LabOrderResponse:
    lab_order = await use_case.execute(lab_order_id, payload.to_input())
    return LabOrderResponse.from_entity(lab_order)


@router.patch("/{lab_order_id}/status", response_model=LabOrderResponse)
async def update_lab_order_status(
    lab_order_id: UUID,
    payload: LabOrderStatusUpdateRequest,
    _: RequireLaboratoryUpdate,
    use_case: UpdateLabOrderStatusUseCaseDep,
) -> LabOrderResponse:
    lab_order = await use_case.execute(lab_order_id, payload.to_input())
    return LabOrderResponse.from_entity(lab_order)


@router.patch("/{lab_order_id}/results", response_model=LabOrderResponse)
async def update_lab_results(
    lab_order_id: UUID,
    payload: LabResultsUpdateRequest,
    current_user: RequireLaboratoryUpdate,
    use_case: UpdateLabResultsUseCaseDep,
) -> LabOrderResponse:
    lab_order = await use_case.execute(lab_order_id, payload.to_input(), resulted_by=current_user.id)
    return LabOrderResponse.from_entity(lab_order)


@router.post("/{lab_order_id}/results/email", response_model=ReportEmailDeliveryResponse)
async def email_lab_results(
    lab_order_id: UUID,
    payload: LabResultsEmailRequest,
    current_user: RequireLaboratoryUpdate,
    use_case: SendLabResultsEmailUseCaseDep,
) -> ReportEmailDeliveryResponse:
    delivery = await use_case.execute(lab_order_id, payload.to_input(), created_by=current_user.id)
    return ReportEmailDeliveryResponse(
        id=delivery.id,
        resource_type=delivery.resource_type,
        resource_id=delivery.resource_id,
        recipient_email=delivery.recipient_email,
        recipient_role=delivery.recipient_role,
        subject=delivery.subject,
        status=delivery.status,
        sent_at=delivery.sent_at,
        created_at=delivery.created_at,
    )


@router.delete("/{lab_order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lab_order(
    lab_order_id: UUID,
    _: RequireLaboratoryDelete,
    use_case: DeleteLabOrderUseCaseDep,
) -> None:
    await use_case.execute(lab_order_id)
