from dataclasses import dataclass
from enum import Enum
from math import ceil
from uuid import UUID

from app.modules.notifications.domain.entities.notification import Notification, NotificationType


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


@dataclass(frozen=True, slots=True)
class NotificationListCriteria:
    user_id: UUID
    page: int = 1
    page_size: int = 20
    sort_dir: SortDirection = SortDirection.DESC
    notification_type: NotificationType | None = None
    is_read: bool | None = None
    q: str | None = None


@dataclass(frozen=True, slots=True)
class NotificationPage:
    items: list[Notification]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
