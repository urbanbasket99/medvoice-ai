from uuid import UUID

from fastapi import APIRouter, status

from app.modules.billing.presentation.dependencies import (
    CreatePaymentUseCaseDep,
    GetPaymentPrintUseCaseDep,
    GetPaymentUseCaseDep,
    GetPaymentsUseCaseDep,
    RequireBillingCreate,
    RequireBillingRead,
)
from app.modules.billing.presentation.schemas import (
    PaymentCreateRequest,
    PaymentListResponse,
    PaymentPrintResponse,
    PaymentResponse,
)

router = APIRouter(prefix="/billing/payments", tags=["billing"])


@router.get("", response_model=PaymentListResponse)
async def list_payments(
    _: RequireBillingRead,
    use_case: GetPaymentsUseCaseDep,
    invoice_id: UUID,
) -> PaymentListResponse:
    payments = await use_case.execute(invoice_id)
    return PaymentListResponse.from_entities(payments)


@router.get("/{payment_id}/print", response_model=PaymentPrintResponse)
async def print_payment(
    payment_id: UUID,
    _: RequireBillingRead,
    use_case: GetPaymentPrintUseCaseDep,
) -> PaymentPrintResponse:
    output = await use_case.execute(payment_id)
    return PaymentPrintResponse.from_output(output)


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    _: RequireBillingRead,
    use_case: GetPaymentUseCaseDep,
) -> PaymentResponse:
    payment = await use_case.execute(payment_id)
    return PaymentResponse.from_entity(payment)


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreateRequest,
    _: RequireBillingCreate,
    use_case: CreatePaymentUseCaseDep,
) -> PaymentResponse:
    payment = await use_case.execute(payload.to_input())
    return PaymentResponse.from_entity(payment)
