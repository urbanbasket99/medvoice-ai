"""Patient management endpoints (Patients bounded context — Phase 1: CRUD + search).

Every route requires authentication plus the matching `patients:*`
permission, enforced via the `RequirePatients*` dependencies wired in
`dependencies.py` — each of those also resolves to the acting `User`, used
here to stamp `created_by`/`updated_by`. `/search` is declared before
`/{patient_id}` so FastAPI does not try to parse the literal path segment
`"search"` as a UUID.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.patients.application.dto.patient_dto import CreatePatientInput, UpdatePatientInput
from app.modules.patients.domain.entities.patient import BloodGroup, Gender, PatientStatus
from app.modules.patients.domain.value_objects import (
    PatientListCriteria,
    PatientSortField,
    SortDirection,
)
from app.modules.patients.presentation.dependencies import (
    CreatePatientUseCaseDep,
    DeletePatientUseCaseDep,
    GetPatientUseCaseDep,
    GetPatientsUseCaseDep,
    RequirePatientsCreate,
    RequirePatientsDelete,
    RequirePatientsRead,
    RequirePatientsUpdate,
    SearchPatientsUseCaseDep,
    UpdatePatientUseCaseDep,
)
from app.modules.patients.presentation.schemas import (
    PatientCreateRequest,
    PatientListResponse,
    PatientResponse,
    PatientUpdateRequest,
)

router = APIRouter(prefix="/patients", tags=["patients"])


def _to_create_input(payload: PatientCreateRequest, created_by: UUID) -> CreatePatientInput:
    return CreatePatientInput(**payload.model_dump(), created_by=created_by)


def _to_update_input(payload: PatientUpdateRequest, updated_by: UUID) -> UpdatePatientInput:
    return UpdatePatientInput(**payload.model_dump(), updated_by=updated_by)


@router.get("", response_model=PatientListResponse)
async def list_patients(
    _: RequirePatientsRead,
    use_case: GetPatientsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    sort_by: PatientSortField = PatientSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    status_filter: Annotated[PatientStatus | None, Query(alias="status")] = None,
    gender: Gender | None = None,
    blood_group: BloodGroup | None = None,
    city: Annotated[str | None, Query(max_length=100)] = None,
) -> PatientListResponse:
    criteria = PatientListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        status=status_filter,
        gender=gender,
        blood_group=blood_group,
        city=city,
    )
    result = await use_case.execute(criteria)
    return PatientListResponse.from_page(result)


@router.get("/search", response_model=PatientListResponse)
async def search_patients(
    _: RequirePatientsRead,
    use_case: SearchPatientsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PatientListResponse:
    result = await use_case.execute(q, page, page_size)
    return PatientListResponse.from_page(result)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: UUID, _: RequirePatientsRead, use_case: GetPatientUseCaseDep
) -> PatientResponse:
    patient = await use_case.execute(patient_id)
    return PatientResponse.from_entity(patient)


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreateRequest, current_user: RequirePatientsCreate, use_case: CreatePatientUseCaseDep
) -> PatientResponse:
    patient = await use_case.execute(_to_create_input(payload, current_user.id))
    return PatientResponse.from_entity(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: UUID,
    payload: PatientUpdateRequest,
    current_user: RequirePatientsUpdate,
    use_case: UpdatePatientUseCaseDep,
) -> PatientResponse:
    patient = await use_case.execute(patient_id, _to_update_input(payload, current_user.id))
    return PatientResponse.from_entity(patient)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID, _: RequirePatientsDelete, use_case: DeletePatientUseCaseDep
) -> None:
    await use_case.execute(patient_id)
