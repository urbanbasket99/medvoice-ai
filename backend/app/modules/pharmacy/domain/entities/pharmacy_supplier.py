from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class PharmacySupplier:
    id: UUID
    name: str
    is_active: bool
    created_at: datetime
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    code: str | None = None
    updated_at: datetime | None = None
