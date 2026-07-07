"""The `Appointment` aggregate: a scheduled patient–doctor encounter."""

from dataclasses import dataclass
from datetime import date, datetime, time
from enum import Enum
from uuid import UUID


class AppointmentType(str, Enum):
    NEW = "new"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"
    TELEMEDICINE = "telemedicine"


class AppointmentPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    IN_CONSULTATION = "in_consultation"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Department(str, Enum):
    CARDIOLOGY = "cardiology"
    NEUROLOGY = "neurology"
    ORTHOPEDICS = "orthopedics"
    PEDIATRICS = "pediatrics"
    GENERAL_MEDICINE = "general_medicine"
    DERMATOLOGY = "dermatology"
    ENT = "ent"
    GYNECOLOGY = "gynecology"
    PSYCHIATRY = "psychiatry"
    RADIOLOGY = "radiology"
    ANESTHESIOLOGY = "anesthesiology"
    SURGERY = "surgery"
    OPHTHALMOLOGY = "ophthalmology"
    UROLOGY = "urology"
    ONCOLOGY = "oncology"
    DENTISTRY = "dentistry"
    EMERGENCY_MEDICINE = "emergency_medicine"
    OTHER = "other"


@dataclass(slots=True)
class Appointment:
    id: UUID
    appointment_number: str
    patient_id: UUID
    doctor_id: UUID
    department: Department
    appointment_date: date
    appointment_time: time
    duration_minutes: int
    appointment_type: AppointmentType
    priority: AppointmentPriority
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime
    chief_complaint: str | None = None
    notes: str | None = None
    room: str | None = None
    token_number: int | None = None
    deleted_at: datetime | None = None
    patient_name: str | None = None
    patient_uhid: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
