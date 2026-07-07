from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID


@dataclass(slots=True)
class PharmacyBatch:
    id: UUID
    medicine_id: UUID
    batch_number: str
    expiry_date: date
    quantity: int
    purchase_price: Decimal
    selling_price: Decimal
    created_at: datetime
    supplier_id: UUID | None = None
    supplier_name: str | None = None
    medicine_name: str | None = None
