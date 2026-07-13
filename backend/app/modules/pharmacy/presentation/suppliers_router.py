from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.pharmacy.presentation.dependencies import (
    CreateSupplierUseCaseDep,
    GetSupplierUseCaseDep,
    GetSuppliersUseCaseDep,
    RequirePharmacyCreate,
    RequirePharmacyRead,
    RequirePharmacyUpdate,
    UpdateSupplierUseCaseDep,
)
from app.modules.pharmacy.presentation.schemas import (
    SupplierCreateRequest,
    SupplierListResponse,
    SupplierResponse,
    SupplierUpdateRequest,
)

router = APIRouter(prefix="/pharmacy/suppliers", tags=["pharmacy"])


@router.get("", response_model=SupplierListResponse)
async def list_suppliers(
    _: RequirePharmacyRead,
    use_case: GetSuppliersUseCaseDep,
    active_only: Annotated[bool, Query()] = True,
) -> SupplierListResponse:
    suppliers = await use_case.execute(active_only=active_only)
    return SupplierListResponse(items=[SupplierResponse.from_entity(s) for s in suppliers])


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: UUID,
    _: RequirePharmacyRead,
    use_case: GetSupplierUseCaseDep,
) -> SupplierResponse:
    supplier = await use_case.execute(supplier_id)
    return SupplierResponse.from_entity(supplier)


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    payload: SupplierCreateRequest,
    _: RequirePharmacyCreate,
    use_case: CreateSupplierUseCaseDep,
) -> SupplierResponse:
    supplier = await use_case.execute(payload.to_input())
    return SupplierResponse.from_entity(supplier)


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: UUID,
    payload: SupplierUpdateRequest,
    _: RequirePharmacyUpdate,
    use_case: UpdateSupplierUseCaseDep,
) -> SupplierResponse:
    supplier = await use_case.execute(supplier_id, payload.to_input())
    return SupplierResponse.from_entity(supplier)
