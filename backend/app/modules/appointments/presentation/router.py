from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.appointments.application.dto.appointment_dto import (
    CreateAppointmentInput,
    UpdateAppointmentInput,
)
from app.modules.appointments.domain.entities.appointment import (
    AppointmentPriority,
    AppointmentStatus,
    AppointmentType,
    Department,
)
from app.modules.appointments.domain.value_objects import (
    AppointmentListCriteria,
    AppointmentSortField,
    SortDirection,
)
from app.modules.appointments.presentation.dependencies import (
    CreateAppointmentUseCaseDep,
    DeleteAppointmentUseCaseDep,
    GetAppointmentUseCaseDep,
    GetAppointmentsUseCaseDep,
    RequireAppointmentsCreate,
    RequireAppointmentsDelete,
    RequireAppointmentsRead,
    RequireAppointmentsUpdate,
    SearchAppointmentsUseCaseDep,
    UpdateAppointmentUseCaseDep,
)
from app.modules.appointments.presentation.schemas import (
    AppointmentCreateRequest,
    AppointmentListResponse,
    AppointmentResponse,
    AppointmentUpdateRequest,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _to_create_input(payload: AppointmentCreateRequest) -> CreateAppointmentInput:
    return CreateAppointmentInput(**payload.model_dump())


def _to_update_input(payload: AppointmentUpdateRequest) -> UpdateAppointmentInput:
    return UpdateAppointmentInput(**payload.model_dump())


@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    _: RequireAppointmentsRead,
    use_case: GetAppointmentsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: AppointmentSortField = AppointmentSortField.APPOINTMENT_DATE,
    sort_dir: SortDirection = SortDirection.DESC,
    status_filter: Annotated[AppointmentStatus | None, Query(alias="status")] = None,
    priority: AppointmentPriority | None = None,
    appointment_type: AppointmentType | None = None,
    department: Department | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> AppointmentListResponse:
    criteria = AppointmentListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        status=status_filter,
        priority=priority,
        appointment_type=appointment_type,
        department=department,
        patient_id=patient_id,
        doctor_id=doctor_id,
        date_from=date_from,
        date_to=date_to,
    )
    result = await use_case.execute(criteria)
    return AppointmentListResponse.from_page(result)


@router.get("/search", response_model=AppointmentListResponse)
async def search_appointments(
    _: RequireAppointmentsRead,
    use_case: SearchAppointmentsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> AppointmentListResponse:
    result = await use_case.execute(q, page, page_size)
    return AppointmentListResponse.from_page(result)


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    _: RequireAppointmentsRead,
    use_case: GetAppointmentUseCaseDep,
) -> AppointmentResponse:
    appointment = await use_case.execute(appointment_id)
    return AppointmentResponse.from_entity(appointment)


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreateRequest,
    _: RequireAppointmentsCreate,
    use_case: CreateAppointmentUseCaseDep,
) -> AppointmentResponse:
    appointment = await use_case.execute(_to_create_input(payload))
    return AppointmentResponse.from_entity(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: UUID,
    payload: AppointmentUpdateRequest,
    _: RequireAppointmentsUpdate,
    use_case: UpdateAppointmentUseCaseDep,
) -> AppointmentResponse:
    appointment = await use_case.execute(appointment_id, _to_update_input(payload))
    return AppointmentResponse.from_entity(appointment)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: UUID,
    _: RequireAppointmentsDelete,
    use_case: DeleteAppointmentUseCaseDep,
) -> None:
    await use_case.execute(appointment_id)
