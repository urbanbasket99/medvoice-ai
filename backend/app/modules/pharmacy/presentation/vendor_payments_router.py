from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.pharmacy.presentation.dependencies import (
    CreateVendorPaymentUseCaseDep,
    ListVendorPaymentsUseCaseDep,
    RequirePharmacyCreate,
    RequirePharmacyRead,
)
from app.modules.pharmacy.presentation.schemas import (
    VendorPaymentCreateRequest,
    VendorPaymentListResponse,
    VendorPaymentResponse,
)

router = APIRouter(prefix="/pharmacy/vendor-payments", tags=["pharmacy"])


@router.get("", response_model=VendorPaymentListResponse)
async def list_vendor_payments(
    _: RequirePharmacyRead,
    use_case: ListVendorPaymentsUseCaseDep,
    supplier_id: UUID | None = None,
) -> VendorPaymentListResponse:
    payments = await use_case.execute(supplier_id=supplier_id)
    return VendorPaymentListResponse(
        items=[VendorPaymentResponse.from_entity(payment) for payment in payments]
    )


@router.post("", response_model=VendorPaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor_payment(
    payload: VendorPaymentCreateRequest,
    user: RequirePharmacyCreate,
    use_case: CreateVendorPaymentUseCaseDep,
) -> VendorPaymentResponse:
    payment = await use_case.execute(payload.to_input(created_by=user.id))
    return VendorPaymentResponse.from_entity(payment)
