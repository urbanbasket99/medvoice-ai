from dataclasses import dataclass
from datetime import date, time
from uuid import UUID

from app.modules.appointments.domain.entities.appointment import (
    AppointmentPriority,
    AppointmentStatus,
    AppointmentType,
    Department,
)


@dataclass(frozen=True, slots=True)
class CreateAppointmentInput:
    patient_id: UUID
    doctor_id: UUID
    department: Department
    appointment_date: date
    appointment_time: time
    duration_minutes: int
    appointment_type: AppointmentType
    priority: AppointmentPriority
    chief_complaint: str | None = None
    notes: str | None = None
    room: str | None = None


@dataclass(frozen=True, slots=True)
class UpdateAppointmentInput:
    patient_id: UUID
    doctor_id: UUID
    department: Department
    appointment_date: date
    appointment_time: time
    duration_minutes: int
    appointment_type: AppointmentType
    priority: AppointmentPriority
    status: AppointmentStatus
    chief_complaint: str | None = None
    notes: str | None = None
    room: str | None = None
