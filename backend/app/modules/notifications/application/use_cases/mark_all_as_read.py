from uuid import UUID

from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository


class MarkAllAsReadUseCase:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notifications = notification_repository

    async def execute(self, user_id: UUID) -> int:
        """Marks all unread notifications for the user as read. Returns the count updated."""
        return await self._notifications.mark_all_as_read(user_id)
