from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.laboratory.domain.value_objects import LabPriority, SampleType


@dataclass(frozen=True, slots=True)
class ConsultationContext:
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    visit_number: str | None = None


@dataclass(frozen=True, slots=True)
class LabOrderItemInput:
    lab_test_master_id: UUID | None
    lab_test_name: str
    category: str | None
    sample_type: SampleType
    instructions: str | None
    sort_order: int = 0


@dataclass(frozen=True, slots=True)
class CreateLabOrderInput:
    consultation_id: UUID
    priority: LabPriority
    clinical_notes: str | None
    items: tuple[LabOrderItemInput, ...]


@dataclass(frozen=True, slots=True)
class UpdateLabOrderInput:
    priority: LabPriority
    clinical_notes: str | None
    items: tuple[LabOrderItemInput, ...]


@dataclass(frozen=True, slots=True)
class UpdateLabOrderStatusInput:
    status: str
    notes: str | None = None


@dataclass(frozen=True, slots=True)
class LabOrderPrintItem:
    lab_test_name: str
    category: str | None
    sample_type: str
    instructions: str | None


@dataclass(frozen=True, slots=True)
class LabOrderPrintOutput:
    lab_order_id: UUID
    order_number: str
    consultation_id: UUID
    priority: str
    status: str
    clinical_notes: str | None
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    items: list[LabOrderPrintItem]
    created_at: datetime
