from uuid import UUID

from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository


class GetUnreadCountUseCase:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notifications = notification_repository

    async def execute(self, user_id: UUID) -> int:
        return await self._notifications.get_unread_count(user_id)
