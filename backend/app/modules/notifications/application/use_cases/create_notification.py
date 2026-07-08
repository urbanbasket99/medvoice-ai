from datetime import UTC, datetime
from uuid import uuid4

from app.modules.notifications.application.dto.notification_dto import CreateNotificationInput
from app.modules.notifications.domain.entities.notification import Notification
from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository


class CreateNotificationUseCase:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notifications = notification_repository

    async def execute(self, data: CreateNotificationInput) -> Notification:
        now = datetime.now(UTC)
        notification = Notification(
            id=uuid4(),
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            notification_type=data.notification_type,
            severity=data.severity,
            is_read=False,
            created_at=now,
            updated_at=now,
            read_at=None,
            action_url=data.action_url,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            metadata=data.metadata,
        )
        return await self._notifications.create(notification)
