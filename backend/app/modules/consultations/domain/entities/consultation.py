"""The `Consultation` aggregate: a clinical encounter linked to an appointment."""

from dataclasses import dataclass
from datetime import date, datetime, time
from enum import Enum
from uuid import UUID


class ConsultationStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


@dataclass(frozen=True, slots=True)
class VitalSigns:
    blood_pressure_systolic: int | None = None
    blood_pressure_diastolic: int | None = None
    pulse: int | None = None
    temperature: float | None = None
    spo2: int | None = None
    respiratory_rate: int | None = None
    weight_kg: float | None = None
    height_cm: float | None = None


@dataclass(slots=True)
class Consultation:
    id: UUID
    visit_number: str
    appointment_id: UUID
    patient_id: UUID
    doctor_id: UUID
    status: ConsultationStatus
    created_at: datetime
    updated_at: datetime
    chief_complaint: str | None = None
    history_of_present_illness: str | None = None
    past_medical_history: str | None = None
    family_history: str | None = None
    allergies: str | None = None
    current_medications: str | None = None
    vital_signs: VitalSigns | None = None
    physical_examination: str | None = None
    diagnosis: str | None = None
    assessment: str | None = None
    treatment_plan: str | None = None
    doctor_notes: str | None = None
    follow_up_date: date | None = None
    deleted_at: datetime | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    appointment_number: str | None = None
    appointment_date: date | None = None
    appointment_time: time | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
