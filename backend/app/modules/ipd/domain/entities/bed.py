from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.modules.ipd.domain.value_objects import BedStatus


@dataclass(slots=True)
class Bed:
    id: UUID
    ward_id: UUID
    bed_number: str
    status: BedStatus
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    ward_code: str | None = None
    ward_name: str | None = None
    ward_type: str | None = None
    ward_floor: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
