from dataclasses import dataclass
from datetime import date
from uuid import UUID

from app.modules.consultations.domain.entities.consultation import ConsultationStatus, VitalSigns


@dataclass(frozen=True, slots=True)
class CreateConsultationInput:
    appointment_id: UUID


@dataclass(frozen=True, slots=True)
class UpdateConsultationInput:
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
    status: ConsultationStatus = ConsultationStatus.IN_PROGRESS
