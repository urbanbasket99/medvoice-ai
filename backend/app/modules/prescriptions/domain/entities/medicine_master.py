"""Medicine catalog entry for prescription autocomplete."""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.modules.prescriptions.domain.value_objects import Route


@dataclass(slots=True)
class MedicineMaster:
    id: UUID
    name: str
    created_at: datetime
    generic_name: str | None = None
    strength: str | None = None
    form: str | None = None
    default_route: Route | None = None
    manufacturer: str | None = None
    is_active: bool = True
