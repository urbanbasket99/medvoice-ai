from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.notifications.domain.entities.notification import Notification
from app.modules.notifications.domain.value_objects import NotificationListCriteria, NotificationPage


class NotificationRepository(ABC):
    @abstractmethod
    async def get_by_id(self, notification_id: UUID, user_id: UUID) -> Notification | None: ...

    @abstractmethod
    async def list(self, criteria: NotificationListCriteria) -> NotificationPage: ...

    @abstractmethod
    async def get_unread_count(self, user_id: UUID) -> int: ...

    @abstractmethod
    async def create(self, notification: Notification) -> Notification: ...

    @abstractmethod
    async def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Notification | None: ...

    @abstractmethod
    async def mark_all_as_read(self, user_id: UUID) -> int: ...

    @abstractmethod
    async def soft_delete(self, notification_id: UUID, user_id: UUID) -> bool: ...
