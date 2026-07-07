from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.prescriptions.domain.value_objects import (
    DosageInstruction,
    Duration,
    Frequency,
    Route,
)


@dataclass(frozen=True, slots=True)
class ConsultationContext:
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    visit_number: str | None = None


@dataclass(frozen=True, slots=True)
class PrescriptionItemInput:
    medicine_name: str
    frequency: Frequency
    route: Route
    medicine_master_id: UUID | None = None
    strength: str | None = None
    dosage: str | None = None
    duration: str | None = None
    quantity: str | None = None
    instructions: str | None = None
    sort_order: int = 0
    dosage_instruction: DosageInstruction | None = None


@dataclass(frozen=True, slots=True)
class CreatePrescriptionInput:
    consultation_id: UUID
    diagnosis: str | None = None
    advice: str | None = None
    items: tuple[PrescriptionItemInput, ...] = ()


@dataclass(frozen=True, slots=True)
class UpdatePrescriptionInput:
    diagnosis: str | None = None
    advice: str | None = None
    items: tuple[PrescriptionItemInput, ...] = ()


@dataclass(frozen=True, slots=True)
class PrescriptionPrintItem:
    medicine_name: str
    strength: str | None
    dosage: str | None
    frequency: str
    route: str
    duration: str | None
    quantity: str | None
    instructions: str | None
    dosage_summary: str | None


@dataclass(frozen=True, slots=True)
class PrescriptionPrintOutput:
    prescription_id: UUID
    consultation_id: UUID
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    diagnosis: str | None
    advice: str | None
    items: list[PrescriptionPrintItem]
    created_at: datetime


@dataclass(frozen=True, slots=True)
class PrescriptionPdfExportOutput:
    pdf_placeholder: bool
    message: str
    prescription_id: UUID
