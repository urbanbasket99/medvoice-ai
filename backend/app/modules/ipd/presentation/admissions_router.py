from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.ipd.domain.value_objects import (
    AdmissionListCriteria,
    AdmissionSortField,
    AdmissionStatus,
    AdmissionType,
    SortDirection,
)
from app.modules.ipd.presentation.dependencies import (
    CancelAdmissionUseCaseDep,
    CreateAdmissionUseCaseDep,
    DischargeAdmissionUseCaseDep,
    GetAdmissionUseCaseDep,
    GetAdmissionsUseCaseDep,
    RequireIpdCreate,
    RequireIpdRead,
    RequireIpdUpdate,
    UpdateAdmissionUseCaseDep,
)
from app.modules.ipd.presentation.schemas import (
    AdmissionCreateRequest,
    AdmissionDischargeRequest,
    AdmissionListResponse,
    AdmissionResponse,
    AdmissionUpdateRequest,
)

router = APIRouter(prefix="/ipd/admissions", tags=["ipd"])


@router.get("", response_model=AdmissionListResponse)
async def list_admissions(
    _: RequireIpdRead,
    use_case: GetAdmissionsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: AdmissionSortField = AdmissionSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    patient_id: UUID | None = None,
    admitting_doctor_id: UUID | None = None,
    consultation_id: UUID | None = None,
    bed_id: UUID | None = None,
    status_filter: AdmissionStatus | None = Query(default=None, alias="status"),
    admission_type: AdmissionType | None = None,
) -> AdmissionListResponse:
    criteria = AdmissionListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        patient_id=patient_id,
        admitting_doctor_id=admitting_doctor_id,
        consultation_id=consultation_id,
        bed_id=bed_id,
        status=status_filter,
        admission_type=admission_type,
    )
    result = await use_case.execute(criteria)
    return AdmissionListResponse.from_page(result)


@router.get("/{admission_id}", response_model=AdmissionResponse)
async def get_admission(
    admission_id: UUID,
    _: RequireIpdRead,
    use_case: GetAdmissionUseCaseDep,
) -> AdmissionResponse:
    admission = await use_case.execute(admission_id)
    return AdmissionResponse.from_entity(admission)


@router.post("", response_model=AdmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_admission(
    payload: AdmissionCreateRequest,
    _: RequireIpdCreate,
    use_case: CreateAdmissionUseCaseDep,
) -> AdmissionResponse:
    admission = await use_case.execute(payload.to_input())
    return AdmissionResponse.from_entity(admission)


@router.put("/{admission_id}", response_model=AdmissionResponse)
async def update_admission(
    admission_id: UUID,
    payload: AdmissionUpdateRequest,
    _: RequireIpdUpdate,
    use_case: UpdateAdmissionUseCaseDep,
) -> AdmissionResponse:
    admission = await use_case.execute(admission_id, payload.to_input())
    return AdmissionResponse.from_entity(admission)


@router.post("/{admission_id}/discharge", response_model=AdmissionResponse)
async def discharge_admission(
    admission_id: UUID,
    payload: AdmissionDischargeRequest,
    _: RequireIpdUpdate,
    use_case: DischargeAdmissionUseCaseDep,
) -> AdmissionResponse:
    admission = await use_case.execute(admission_id, payload.to_input())
    return AdmissionResponse.from_entity(admission)


@router.post("/{admission_id}/cancel", response_model=AdmissionResponse)
async def cancel_admission(
    admission_id: UUID,
    _: RequireIpdUpdate,
    use_case: CancelAdmissionUseCaseDep,
) -> AdmissionResponse:
    admission = await use_case.execute(admission_id)
    return AdmissionResponse.from_entity(admission)
