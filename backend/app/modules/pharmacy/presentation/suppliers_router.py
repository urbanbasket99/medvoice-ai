from fastapi import APIRouter

from app.modules.pharmacy.presentation.dependencies import GetSuppliersUseCaseDep, RequirePharmacyRead
from app.modules.pharmacy.presentation.schemas import SupplierResponse

router = APIRouter(prefix="/pharmacy/suppliers", tags=["pharmacy"])


@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(
    _: RequirePharmacyRead,
    use_case: GetSuppliersUseCaseDep,
) -> list[SupplierResponse]:
    suppliers = await use_case.execute()
    return [SupplierResponse.from_entity(s) for s in suppliers]
