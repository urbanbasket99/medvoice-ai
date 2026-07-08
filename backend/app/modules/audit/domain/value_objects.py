from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import UUID

from app.modules.audit.domain.entities.audit_log import AuditAction, AuditLog


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


@dataclass(slots=True)
class AuditLogListCriteria:
    page: int = 1
    page_size: int = 20
    sort_dir: SortDirection = SortDirection.DESC
    module: str | None = None
    action: AuditAction | None = None
    user_id: UUID | None = None
    entity: str | None = None
    entity_id: UUID | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    q: str | None = None


@dataclass(slots=True)
class AuditLogPage:
    items: list[AuditLog]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size
