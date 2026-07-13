from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.pharmacy.domain.value_objects import (
    DispenseListCriteria,
    DispenseSortField,
    DispenseStatus,
    DispenseType,
    SortDirection,
)
from app.modules.pharmacy.presentation.dependencies import (
    CreateDispenseUseCaseDep,
    DeleteDispenseUseCaseDep,
    GetDispensePrintUseCaseDep,
    GetDispenseUseCaseDep,
    GetDispensesByPrescriptionUseCaseDep,
    GetDispensesUseCaseDep,
    RequirePharmacyCreate,
    RequirePharmacyDelete,
    RequirePharmacyRead,
    RequirePharmacyUpdate,
    SearchDispensesUseCaseDep,
    UpdateDispenseStatusUseCaseDep,
    UpdateDispenseUseCaseDep,
)
from app.modules.pharmacy.presentation.schemas import (
    DispenseCreateRequest,
    DispenseListResponse,
    DispensePrintResponse,
    DispenseResponse,
    DispenseStatusUpdateRequest,
    DispenseUpdateRequest,
)

router = APIRouter(prefix="/pharmacy/dispenses", tags=["pharmacy"])


@router.get("", response_model=DispenseListResponse)
async def list_dispenses(
    _: RequirePharmacyRead,
    use_case: GetDispensesUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: DispenseSortField = DispenseSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    prescription_id: UUID | None = None,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    status: DispenseStatus | None = None,
    dispense_type: DispenseType | None = None,
) -> DispenseListResponse:
    criteria = DispenseListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        prescription_id=prescription_id,
        consultation_id=consultation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        status=status,
        dispense_type=dispense_type,
    )
    result = await use_case.execute(criteria)
    return DispenseListResponse.from_page(result)


@router.get("/search", response_model=DispenseListResponse)
async def search_dispenses(
    _: RequirePharmacyRead,
    use_case: SearchDispensesUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> DispenseListResponse:
    result = await use_case.execute(q, page, page_size)
    return DispenseListResponse.from_page(result)


@router.get("/by-prescription/{prescription_id}", response_model=list[DispenseResponse])
async def list_dispenses_by_prescription(
    prescription_id: UUID,
    _: RequirePharmacyRead,
    use_case: GetDispensesByPrescriptionUseCaseDep,
) -> list[DispenseResponse]:
    dispenses = await use_case.execute(prescription_id)
    return [DispenseResponse.from_entity(d) for d in dispenses]


@router.get("/{dispense_id}/print", response_model=DispensePrintResponse)
async def print_dispense(
    dispense_id: UUID,
    _: RequirePharmacyRead,
    use_case: GetDispensePrintUseCaseDep,
) -> DispensePrintResponse:
    output = await use_case.execute(dispense_id)
    return DispensePrintResponse.from_output(output)


@router.get("/{dispense_id}", response_model=DispenseResponse)
async def get_dispense(
    dispense_id: UUID,
    _: RequirePharmacyRead,
    use_case: GetDispenseUseCaseDep,
) -> DispenseResponse:
    dispense = await use_case.execute(dispense_id)
    return DispenseResponse.from_entity(dispense)


@router.post("", response_model=DispenseResponse, status_code=status.HTTP_201_CREATED)
async def create_dispense(
    payload: DispenseCreateRequest,
    _: RequirePharmacyCreate,
    use_case: CreateDispenseUseCaseDep,
) -> DispenseResponse:
    dispense = await use_case.execute(payload.to_input())
    return DispenseResponse.from_entity(dispense)


@router.put("/{dispense_id}", response_model=DispenseResponse)
async def update_dispense(
    dispense_id: UUID,
    payload: DispenseUpdateRequest,
    _: RequirePharmacyUpdate,
    use_case: UpdateDispenseUseCaseDep,
) -> DispenseResponse:
    dispense = await use_case.execute(dispense_id, payload.to_input())
    return DispenseResponse.from_entity(dispense)


@router.patch("/{dispense_id}/status", response_model=DispenseResponse)
async def update_dispense_status(
    dispense_id: UUID,
    payload: DispenseStatusUpdateRequest,
    _: RequirePharmacyUpdate,
    use_case: UpdateDispenseStatusUseCaseDep,
) -> DispenseResponse:
    dispense = await use_case.execute(dispense_id, payload.to_input())
    return DispenseResponse.from_entity(dispense)


@router.delete("/{dispense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dispense(
    dispense_id: UUID,
    _: RequirePharmacyDelete,
    use_case: DeleteDispenseUseCaseDep,
) -> None:
    await use_case.execute(dispense_id)
