"""The `LabOrder` aggregate and its line items."""

from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.laboratory.domain.value_objects import LabPriority, LabStatus, SampleType


@dataclass(slots=True)
class LabOrderStatusEvent:
    id: UUID
    lab_order_id: UUID
    status: LabStatus
    notes: str | None
    changed_at: datetime


@dataclass(slots=True)
class LabOrderItem:
    id: UUID
    lab_order_id: UUID
    lab_test_name: str
    category: str | None
    sample_type: SampleType
    sort_order: int = 0
    lab_test_master_id: UUID | None = None
    instructions: str | None = None


@dataclass(slots=True)
class LabOrder:
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    order_number: str
    priority: LabPriority
    status: LabStatus
    created_at: datetime
    updated_at: datetime
    clinical_notes: str | None = None
    deleted_at: datetime | None = None
    items: list[LabOrderItem] | None = None
    status_history: list[LabOrderStatusEvent] | None = None
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
