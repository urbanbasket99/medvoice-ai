from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.laboratory.domain.value_objects import LabPriority, ResultFlag, SampleType


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
class LabResultItemInput:
    id: UUID
    result_value: str | None = None
    result_unit: str | None = None
    reference_range: str | None = None
    result_flag: ResultFlag | None = None
    result_notes: str | None = None
    sample_barcode: str | None = None


@dataclass(frozen=True, slots=True)
class UpdateLabResultsInput:
    items: tuple[LabResultItemInput, ...]
    is_partial_report: bool = False


@dataclass(frozen=True, slots=True)
class SendLabResultsEmailInput:
    recipient_email: str
    recipient_role: str | None = None


@dataclass(frozen=True, slots=True)
class LabOrderPrintItem:
    lab_test_name: str
    category: str | None
    sample_type: str
    instructions: str | None
    result_value: str | None = None
    result_unit: str | None = None
    reference_range: str | None = None
    result_flag: str | None = None
    result_notes: str | None = None


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


@dataclass(frozen=True, slots=True)
class LabResultsPrintItem:
    lab_test_name: str
    category: str | None
    sample_type: str
    result_value: str | None
    result_unit: str | None
    reference_range: str | None
    result_flag: str | None
    result_notes: str | None
    resulted_at: datetime | None


@dataclass(frozen=True, slots=True)
class LabResultsPrintOutput:
    lab_order_id: UUID
    order_number: str
    consultation_id: UUID
    status: str
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    items: list[LabResultsPrintItem]
    created_at: datetime
