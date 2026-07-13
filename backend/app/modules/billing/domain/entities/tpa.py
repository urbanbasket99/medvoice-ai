"""TPA (Third Party Administrator) master entity."""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class Tpa:
    id: UUID
    code: str
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
