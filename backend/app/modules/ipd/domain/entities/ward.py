from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.modules.ipd.domain.value_objects import WardType


@dataclass(slots=True)
class Ward:
    id: UUID
    code: str
    name: str
    ward_type: WardType
    created_at: datetime
    updated_at: datetime
    floor: str | None = None
    is_active: bool = True
    deleted_at: datetime | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
