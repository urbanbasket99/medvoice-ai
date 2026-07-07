from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.radiology.domain.value_objects import ImagingCategory, RadiologyPriority


@dataclass(frozen=True, slots=True)
class ConsultationContext:
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    visit_number: str | None = None


@dataclass(frozen=True, slots=True)
class RadiologyOrderItemInput:
    radiology_test_master_id: UUID | None
    test_name: str
    category: ImagingCategory
    body_part: str
    contrast_required: bool
    instructions: str | None
    sort_order: int = 0


@dataclass(frozen=True, slots=True)
class CreateRadiologyOrderInput:
    consultation_id: UUID
    priority: RadiologyPriority
    clinical_notes: str | None
    items: tuple[RadiologyOrderItemInput, ...]


@dataclass(frozen=True, slots=True)
class UpdateRadiologyOrderInput:
    priority: RadiologyPriority
    clinical_notes: str | None
    items: tuple[RadiologyOrderItemInput, ...]


@dataclass(frozen=True, slots=True)
class UpdateRadiologyOrderStatusInput:
    status: str
    notes: str | None = None


@dataclass(frozen=True, slots=True)
class RadiologyOrderPrintItem:
    test_name: str
    category: str
    body_part: str
    contrast_required: bool
    instructions: str | None


@dataclass(frozen=True, slots=True)
class RadiologyOrderPrintOutput:
    radiology_order_id: UUID
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
    items: list[RadiologyOrderPrintItem]
    created_at: datetime
