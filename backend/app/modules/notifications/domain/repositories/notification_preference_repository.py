from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.notifications.domain.entities.notification_preference import NotificationPreference


class NotificationPreferenceRepository(ABC):
    @abstractmethod
    async def get_by_user_id(self, user_id: UUID) -> NotificationPreference | None: ...

    @abstractmethod
    async def create(self, preference: NotificationPreference) -> NotificationPreference: ...

    @abstractmethod
    async def update(self, preference: NotificationPreference) -> NotificationPreference: ...
