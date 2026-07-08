from uuid import UUID

from app.modules.notifications.domain.exceptions import NotificationNotFoundError
from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository


class DeleteNotificationUseCase:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notifications = notification_repository

    async def execute(self, notification_id: UUID, user_id: UUID) -> None:
        deleted = await self._notifications.soft_delete(notification_id, user_id)
        if not deleted:
            raise NotificationNotFoundError(f"Notification {notification_id} not found.")
