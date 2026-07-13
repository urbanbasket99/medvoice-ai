from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.pharmacy.domain.value_objects import VendorPaymentMethod


@dataclass(slots=True)
class VendorPayment:
    id: UUID
    payment_number: str
    supplier_id: UUID
    amount: Decimal
    payment_date: date
    payment_method: VendorPaymentMethod
    created_at: datetime
    reference_number: str | None = None
    notes: str | None = None
    created_by: UUID | None = None
    supplier_name: str | None = None
