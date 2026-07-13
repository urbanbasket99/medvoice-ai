from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.pharmacy.domain.value_objects import MedicineCategory, MedicineListCriteria, MedicineSortField, SortDirection
from app.modules.pharmacy.presentation.dependencies import (
    CreateMedicineUseCaseDep,
    DeleteMedicineUseCaseDep,
    GetMedicineByBarcodeUseCaseDep,
    GetMedicineUseCaseDep,
    GetMedicinesUseCaseDep,
    RequirePharmacyCreate,
    RequirePharmacyDelete,
    RequirePharmacyRead,
    RequirePharmacyUpdate,
    SearchMedicinesUseCaseDep,
    UpdateMedicineUseCaseDep,
)
from app.modules.pharmacy.presentation.schemas import (
    MedicineCreateRequest,
    MedicineListResponse,
    MedicineResponse,
    MedicineUpdateRequest,
)

router = APIRouter(prefix="/pharmacy/medicines", tags=["pharmacy"])


@router.get("", response_model=MedicineListResponse)
async def list_medicines(
    _: RequirePharmacyRead,
    use_case: GetMedicinesUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: MedicineSortField = MedicineSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    category: MedicineCategory | None = None,
    is_active: bool | None = None,
) -> MedicineListResponse:
    criteria = MedicineListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        category=category,
        is_active=is_active,
    )
    result = await use_case.execute(criteria)
    return MedicineListResponse.from_page(result)


@router.get("/search", response_model=MedicineListResponse)
async def search_medicines(
    _: RequirePharmacyRead,
    use_case: SearchMedicinesUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> MedicineListResponse:
    result = await use_case.execute(q, page, page_size)
    return MedicineListResponse.from_page(result)


@router.get("/by-barcode/{barcode}", response_model=MedicineResponse)
async def get_medicine_by_barcode(
    barcode: str,
    _: RequirePharmacyRead,
    use_case: GetMedicineByBarcodeUseCaseDep,
) -> MedicineResponse:
    medicine = await use_case.execute(barcode)
    return MedicineResponse.from_entity(medicine)


@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(
    medicine_id: UUID,
    _: RequirePharmacyRead,
    use_case: GetMedicineUseCaseDep,
) -> MedicineResponse:
    medicine = await use_case.execute(medicine_id)
    return MedicineResponse.from_entity(medicine)


@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
async def create_medicine(
    payload: MedicineCreateRequest,
    _: RequirePharmacyCreate,
    use_case: CreateMedicineUseCaseDep,
) -> MedicineResponse:
    medicine = await use_case.execute(payload.to_input())
    return MedicineResponse.from_entity(medicine)


@router.put("/{medicine_id}", response_model=MedicineResponse)
async def update_medicine(
    medicine_id: UUID,
    payload: MedicineUpdateRequest,
    _: RequirePharmacyUpdate,
    use_case: UpdateMedicineUseCaseDep,
) -> MedicineResponse:
    medicine = await use_case.execute(medicine_id, payload.to_input())
    return MedicineResponse.from_entity(medicine)


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medicine(
    medicine_id: UUID,
    _: RequirePharmacyDelete,
    use_case: DeleteMedicineUseCaseDep,
) -> None:
    await use_case.execute(medicine_id)
