from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.prescriptions.domain.value_objects import (
    PrescriptionListCriteria,
    PrescriptionSortField,
    SortDirection,
)
from app.modules.prescriptions.presentation.dependencies import (
    CreatePrescriptionUseCaseDep,
    DeletePrescriptionUseCaseDep,
    ExportPrescriptionPdfUseCaseDep,
    GetPrescriptionPrintUseCaseDep,
    GetPrescriptionUseCaseDep,
    GetPrescriptionsUseCaseDep,
    RequirePrescriptionsCreate,
    RequirePrescriptionsDelete,
    RequirePrescriptionsRead,
    RequirePrescriptionsUpdate,
    SearchPrescriptionsUseCaseDep,
    UpdatePrescriptionUseCaseDep,
)
from app.modules.prescriptions.presentation.schemas import (
    PrescriptionCreateRequest,
    PrescriptionListResponse,
    PrescriptionPdfExportResponse,
    PrescriptionPrintResponse,
    PrescriptionResponse,
    PrescriptionUpdateRequest,
)

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


@router.get("", response_model=PrescriptionListResponse)
async def list_prescriptions(
    _: RequirePrescriptionsRead,
    use_case: GetPrescriptionsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: PrescriptionSortField = PrescriptionSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
) -> PrescriptionListResponse:
    criteria = PrescriptionListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        consultation_id=consultation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
    )
    result = await use_case.execute(criteria)
    return PrescriptionListResponse.from_page(result)


@router.get("/search", response_model=PrescriptionListResponse)
async def search_prescriptions(
    _: RequirePrescriptionsRead,
    use_case: SearchPrescriptionsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> PrescriptionListResponse:
    result = await use_case.execute(q, page, page_size)
    return PrescriptionListResponse.from_page(result)


@router.get("/{prescription_id}/print", response_model=PrescriptionPrintResponse)
async def print_prescription(
    prescription_id: UUID,
    _: RequirePrescriptionsRead,
    use_case: GetPrescriptionPrintUseCaseDep,
) -> PrescriptionPrintResponse:
    output = await use_case.execute(prescription_id)
    return PrescriptionPrintResponse.from_output(output)


@router.get("/{prescription_id}/export-pdf", response_model=PrescriptionPdfExportResponse)
async def export_prescription_pdf(
    prescription_id: UUID,
    _: RequirePrescriptionsRead,
    use_case: ExportPrescriptionPdfUseCaseDep,
) -> PrescriptionPdfExportResponse:
    output = await use_case.execute(prescription_id)
    return PrescriptionPdfExportResponse.from_output(output)


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: UUID,
    _: RequirePrescriptionsRead,
    use_case: GetPrescriptionUseCaseDep,
) -> PrescriptionResponse:
    prescription = await use_case.execute(prescription_id)
    return PrescriptionResponse.from_entity(prescription)


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    payload: PrescriptionCreateRequest,
    _: RequirePrescriptionsCreate,
    use_case: CreatePrescriptionUseCaseDep,
) -> PrescriptionResponse:
    prescription = await use_case.execute(payload.to_input())
    return PrescriptionResponse.from_entity(prescription)


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: UUID,
    payload: PrescriptionUpdateRequest,
    _: RequirePrescriptionsUpdate,
    use_case: UpdatePrescriptionUseCaseDep,
) -> PrescriptionResponse:
    prescription = await use_case.execute(prescription_id, payload.to_input())
    return PrescriptionResponse.from_entity(prescription)


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescription(
    prescription_id: UUID,
    _: RequirePrescriptionsDelete,
    use_case: DeletePrescriptionUseCaseDep,
) -> None:
    await use_case.execute(prescription_id)
