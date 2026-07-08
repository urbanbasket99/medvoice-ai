from dataclasses import dataclass
from uuid import UUID

from app.modules.notifications.domain.entities.notification import (
    NotificationSeverity,
    NotificationType,
)


@dataclass(frozen=True, slots=True)
class CreateNotificationInput:
    user_id: UUID
    title: str
    message: str
    notification_type: NotificationType
    severity: NotificationSeverity = NotificationSeverity.INFORMATION
    action_url: str | None = None
    entity_type: str | None = None
    entity_id: UUID | None = None
    metadata: dict | None = None


@dataclass(frozen=True, slots=True)
class UpdatePreferencesInput:
    email_enabled: bool
    push_enabled: bool
    in_app_enabled: bool
    type_preferences: dict
