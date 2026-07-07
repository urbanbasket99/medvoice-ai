from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.billing.domain.value_objects import (
    InvoiceListCriteria,
    InvoiceSortField,
    InvoiceStatus,
    SortDirection,
)
from app.modules.billing.presentation.dependencies import (
    CreateInvoiceUseCaseDep,
    DeleteInvoiceUseCaseDep,
    GetConsultationChargesUseCaseDep,
    GetInvoicePrintUseCaseDep,
    GetInvoiceUseCaseDep,
    GetInvoicesUseCaseDep,
    GetOutstandingInvoicesUseCaseDep,
    IssueInvoiceUseCaseDep,
    RequireBillingCreate,
    RequireBillingDelete,
    RequireBillingRead,
    RequireBillingUpdate,
    SearchInvoicesUseCaseDep,
    UpdateInvoiceUseCaseDep,
)
from app.modules.billing.presentation.schemas import (
    ConsultationChargesResponse,
    InvoiceCreateRequest,
    InvoiceListResponse,
    InvoicePrintResponse,
    InvoiceResponse,
    InvoiceUpdateRequest,
)

router = APIRouter(prefix="/billing/invoices", tags=["billing"])


@router.get("", response_model=InvoiceListResponse)
async def list_invoices(
    _: RequireBillingRead,
    use_case: GetInvoicesUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: InvoiceSortField = InvoiceSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    status: InvoiceStatus | None = None,
) -> InvoiceListResponse:
    criteria = InvoiceListCriteria(
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
    return InvoiceListResponse.from_page(result)


@router.get("/search", response_model=InvoiceListResponse)
async def search_invoices(
    _: RequireBillingRead,
    use_case: SearchInvoicesUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> InvoiceListResponse:
    result = await use_case.execute(q, page, page_size)
    return InvoiceListResponse.from_page(result)


@router.get("/outstanding", response_model=InvoiceListResponse)
async def list_outstanding_invoices(
    _: RequireBillingRead,
    use_case: GetOutstandingInvoicesUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> InvoiceListResponse:
    result = await use_case.execute(page, page_size)
    return InvoiceListResponse.from_page(result)


@router.get("/charges", response_model=ConsultationChargesResponse)
async def get_consultation_charges(
    _: RequireBillingRead,
    use_case: GetConsultationChargesUseCaseDep,
    consultation_id: UUID,
) -> ConsultationChargesResponse:
    suggestions = await use_case.execute(consultation_id)
    return ConsultationChargesResponse.from_dtos(suggestions)


@router.get("/{invoice_id}/print", response_model=InvoicePrintResponse)
async def print_invoice(
    invoice_id: UUID,
    _: RequireBillingRead,
    use_case: GetInvoicePrintUseCaseDep,
) -> InvoicePrintResponse:
    output = await use_case.execute(invoice_id)
    return InvoicePrintResponse.from_output(output)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    _: RequireBillingRead,
    use_case: GetInvoiceUseCaseDep,
) -> InvoiceResponse:
    invoice = await use_case.execute(invoice_id)
    return InvoiceResponse.from_entity(invoice)


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreateRequest,
    _: RequireBillingCreate,
    use_case: CreateInvoiceUseCaseDep,
) -> InvoiceResponse:
    invoice = await use_case.execute(payload.to_input())
    return InvoiceResponse.from_entity(invoice)


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID,
    payload: InvoiceUpdateRequest,
    _: RequireBillingUpdate,
    use_case: UpdateInvoiceUseCaseDep,
) -> InvoiceResponse:
    invoice = await use_case.execute(invoice_id, payload.to_input())
    return InvoiceResponse.from_entity(invoice)


@router.patch("/{invoice_id}/issue", response_model=InvoiceResponse)
async def issue_invoice(
    invoice_id: UUID,
    _: RequireBillingUpdate,
    use_case: IssueInvoiceUseCaseDep,
) -> InvoiceResponse:
    invoice = await use_case.execute(invoice_id)
    return InvoiceResponse.from_entity(invoice)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: UUID,
    _: RequireBillingDelete,
    use_case: DeleteInvoiceUseCaseDep,
) -> None:
    await use_case.execute(invoice_id)
