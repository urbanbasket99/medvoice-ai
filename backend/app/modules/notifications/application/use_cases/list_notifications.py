from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository
from app.modules.notifications.domain.value_objects import NotificationListCriteria, NotificationPage


class ListNotificationsUseCase:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notifications = notification_repository

    async def execute(self, criteria: NotificationListCriteria) -> NotificationPage:
        return await self._notifications.list(criteria)
