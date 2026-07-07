"""The `RadiologyOrder` aggregate and its line items."""

from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.radiology.domain.value_objects import ImagingCategory, RadiologyPriority, RadiologyStatus


@dataclass(slots=True)
class RadiologyOrderStatusEvent:
    id: UUID
    radiology_order_id: UUID
    status: RadiologyStatus
    notes: str | None
    changed_at: datetime


@dataclass(slots=True)
class RadiologyOrderItem:
    id: UUID
    radiology_order_id: UUID
    test_name: str
    category: ImagingCategory
    body_part: str
    contrast_required: bool
    sort_order: int = 0
    radiology_test_master_id: UUID | None = None
    instructions: str | None = None


@dataclass(slots=True)
class RadiologyOrder:
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    order_number: str
    priority: RadiologyPriority
    status: RadiologyStatus
    created_at: datetime
    updated_at: datetime
    clinical_notes: str | None = None
    deleted_at: datetime | None = None
    items: list[RadiologyOrderItem] | None = None
    status_history: list[RadiologyOrderStatusEvent] | None = None
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
