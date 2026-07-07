from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.modules.pharmacy.domain.value_objects import MedicineCategory


@dataclass(slots=True)
class PharmacyMedicine:
    id: UUID
    medicine_code: str
    generic_name: str
    brand_name: str
    category: MedicineCategory
    mrp: Decimal
    selling_price: Decimal
    gst: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
    strength: str | None = None
    dosage_form: str | None = None
    manufacturer: str | None = None
    barcode: str | None = None
    deleted_at: datetime | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
