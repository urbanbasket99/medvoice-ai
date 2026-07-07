"""Doctor management endpoints (Doctors bounded context: CRUD + search).

Every route requires authentication plus the matching `doctors:*`
permission, enforced via the `RequireDoctors*` dependencies wired in
`dependencies.py`. `/search` is declared before `/{doctor_id}` so FastAPI
does not try to parse the literal path segment `"search"` as a UUID.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.doctors.application.dto.doctor_dto import CreateDoctorInput, UpdateDoctorInput
from app.modules.doctors.domain.entities.doctor import Department, DoctorStatus, Gender
from app.modules.doctors.domain.value_objects import (
    DoctorListCriteria,
    DoctorSortField,
    SortDirection,
)
from app.modules.doctors.presentation.dependencies import (
    CreateDoctorUseCaseDep,
    DeleteDoctorUseCaseDep,
    GetDoctorUseCaseDep,
    GetDoctorsUseCaseDep,
    RequireDoctorsCreate,
    RequireDoctorsDelete,
    RequireDoctorsRead,
    RequireDoctorsUpdate,
    SearchDoctorsUseCaseDep,
    UpdateDoctorUseCaseDep,
)
from app.modules.doctors.presentation.schemas import (
    DoctorCreateRequest,
    DoctorListResponse,
    DoctorResponse,
    DoctorUpdateRequest,
)

router = APIRouter(prefix="/doctors", tags=["doctors"])


def _to_create_input(payload: DoctorCreateRequest) -> CreateDoctorInput:
    return CreateDoctorInput(**payload.model_dump())


def _to_update_input(payload: DoctorUpdateRequest) -> UpdateDoctorInput:
    return UpdateDoctorInput(**payload.model_dump())


@router.get("", response_model=DoctorListResponse)
async def list_doctors(
    _: RequireDoctorsRead,
    use_case: GetDoctorsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    sort_by: DoctorSortField = DoctorSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    status_filter: Annotated[DoctorStatus | None, Query(alias="status")] = None,
    department: Department | None = None,
    gender: Gender | None = None,
    specialization: Annotated[str | None, Query(max_length=150)] = None,
) -> DoctorListResponse:
    criteria = DoctorListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        status=status_filter,
        department=department,
        gender=gender,
        specialization=specialization,
    )
    result = await use_case.execute(criteria)
    return DoctorListResponse.from_page(result)


@router.get("/search", response_model=DoctorListResponse)
async def search_doctors(
    _: RequireDoctorsRead,
    use_case: SearchDoctorsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> DoctorListResponse:
    result = await use_case.execute(q, page, page_size)
    return DoctorListResponse.from_page(result)


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(
    doctor_id: UUID, _: RequireDoctorsRead, use_case: GetDoctorUseCaseDep
) -> DoctorResponse:
    doctor = await use_case.execute(doctor_id)
    return DoctorResponse.from_entity(doctor)


@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    payload: DoctorCreateRequest, _: RequireDoctorsCreate, use_case: CreateDoctorUseCaseDep
) -> DoctorResponse:
    doctor = await use_case.execute(_to_create_input(payload))
    return DoctorResponse.from_entity(doctor)


@router.put("/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(
    doctor_id: UUID,
    payload: DoctorUpdateRequest,
    _: RequireDoctorsUpdate,
    use_case: UpdateDoctorUseCaseDep,
) -> DoctorResponse:
    doctor = await use_case.execute(doctor_id, _to_update_input(payload))
    return DoctorResponse.from_entity(doctor)


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(
    doctor_id: UUID, _: RequireDoctorsDelete, use_case: DeleteDoctorUseCaseDep
) -> None:
    await use_case.execute(doctor_id)
