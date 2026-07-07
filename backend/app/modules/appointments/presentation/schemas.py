from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.appointments.domain.entities.appointment import (
    Appointment,
    AppointmentPriority,
    AppointmentStatus,
    AppointmentType,
    Department,
)
from app.modules.appointments.domain.value_objects import AppointmentPage


class AppointmentBase(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    department: Department
    appointment_date: date
    appointment_time: time
    duration_minutes: int = Field(ge=5, le=480, default=30)
    appointment_type: AppointmentType = AppointmentType.NEW
    priority: AppointmentPriority = AppointmentPriority.NORMAL
    chief_complaint: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=2000)
    room: str | None = Field(default=None, max_length=50)

    @field_validator("appointment_date")
    @classmethod
    def _appointment_date_not_in_past_for_create(cls, value: date) -> date:
        return value


class AppointmentCreateRequest(AppointmentBase):
    pass


class AppointmentUpdateRequest(AppointmentBase):
    status: AppointmentStatus = AppointmentStatus.SCHEDULED


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    appointment_number: str
    patient_id: UUID
    doctor_id: UUID
    patient_name: str | None = None
    patient_uhid: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    department: Department
    appointment_date: date
    appointment_time: time
    duration_minutes: int
    appointment_type: AppointmentType
    priority: AppointmentPriority
    status: AppointmentStatus
    chief_complaint: str | None
    notes: str | None
    room: str | None
    token_number: int | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, appointment: Appointment) -> "AppointmentResponse":
        return cls(
            id=appointment.id,
            appointment_number=appointment.appointment_number,
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            patient_name=appointment.patient_name,
            patient_uhid=appointment.patient_uhid,
            doctor_name=appointment.doctor_name,
            doctor_code=appointment.doctor_code,
            department=appointment.department,
            appointment_date=appointment.appointment_date,
            appointment_time=appointment.appointment_time,
            duration_minutes=appointment.duration_minutes,
            appointment_type=appointment.appointment_type,
            priority=appointment.priority,
            status=appointment.status,
            chief_complaint=appointment.chief_complaint,
            notes=appointment.notes,
            room=appointment.room,
            token_number=appointment.token_number,
            created_at=appointment.created_at,
            updated_at=appointment.updated_at,
        )


class AppointmentListResponse(BaseModel):
    items: list[AppointmentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: AppointmentPage) -> "AppointmentListResponse":
        return cls(
            items=[AppointmentResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )
