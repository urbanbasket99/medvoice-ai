from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.pharmacy.domain.value_objects import DispenseStatus, DispenseType


@dataclass(slots=True)
class DispenseItem:
    id: UUID
    dispense_id: UUID
    medicine_name: str
    quantity: int
    sort_order: int = 0
    prescription_item_id: UUID | None = None
    medicine_id: UUID | None = None
    batch_id: UUID | None = None
    unit_price: Decimal | None = None
    instructions: str | None = None


@dataclass(slots=True)
class DispenseStatusEvent:
    id: UUID
    dispense_id: UUID
    status: DispenseStatus
    changed_at: datetime
    notes: str | None = None


@dataclass(slots=True)
class DispenseRecord:
    id: UUID
    patient_id: UUID
    order_number: str
    status: DispenseStatus
    created_at: datetime
    updated_at: datetime
    dispense_type: DispenseType = DispenseType.PRESCRIPTION
    prescription_id: UUID | None = None
    consultation_id: UUID | None = None
    doctor_id: UUID | None = None
    dispensed_by: UUID | None = None
    notes: str | None = None
    dispensed_at: datetime | None = None
    deleted_at: datetime | None = None
    items: list[DispenseItem] | None = None
    status_history: list[DispenseStatusEvent] | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    consultation_visit_number: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
