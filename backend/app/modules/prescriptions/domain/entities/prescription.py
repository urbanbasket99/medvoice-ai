"""The `Prescription` aggregate and its line items."""

from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.prescriptions.domain.value_objects import (
    DosageInstruction,
    Duration,
    Frequency,
    Route,
)


@dataclass(slots=True)
class PrescriptionItem:
    id: UUID
    prescription_id: UUID
    medicine_name: str
    frequency: Frequency
    route: Route
    sort_order: int = 0
    medicine_master_id: UUID | None = None
    strength: str | None = None
    dosage: str | None = None
    duration: Duration | None = None
    quantity: str | None = None
    instructions: str | None = None
    dosage_instruction: DosageInstruction | None = None


@dataclass(slots=True)
class Prescription:
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    created_at: datetime
    updated_at: datetime
    diagnosis: str | None = None
    advice: str | None = None
    deleted_at: datetime | None = None
    items: list[PrescriptionItem] | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    doctor_specialization: str | None = None
    consultation_visit_number: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
