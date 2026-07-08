from uuid import UUID

from app.modules.notifications.domain.entities.notification import Notification
from app.modules.notifications.domain.exceptions import NotificationNotFoundError
from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository


class MarkAsReadUseCase:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notifications = notification_repository

    async def execute(self, notification_id: UUID, user_id: UUID) -> Notification:
        notification = await self._notifications.mark_as_read(notification_id, user_id)
        if notification is None:
            raise NotificationNotFoundError(f"Notification {notification_id} not found.")
        return notification
