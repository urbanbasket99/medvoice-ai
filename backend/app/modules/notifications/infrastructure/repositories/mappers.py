from app.modules.notifications.domain.entities.notification import (
    Notification,
    NotificationSeverity,
    NotificationType,
)
from app.modules.notifications.domain.entities.notification_preference import NotificationPreference
from app.modules.notifications.infrastructure.models.notification_model import NotificationModel
from app.modules.notifications.infrastructure.models.notification_preference_model import (
    NotificationPreferenceModel,
)


def notification_to_entity(model: NotificationModel) -> Notification:
    return Notification(
        id=model.id,
        user_id=model.user_id,
        title=model.title,
        message=model.message,
        notification_type=NotificationType(model.notification_type),
        severity=NotificationSeverity(model.severity),
        is_read=model.is_read,
        created_at=model.created_at,
        updated_at=model.updated_at,
        read_at=model.read_at,
        action_url=model.action_url,
        entity_type=model.entity_type,
        entity_id=model.entity_id,
        metadata=model.notification_metadata,
        deleted_at=model.deleted_at,
    )


def notification_preference_to_entity(model: NotificationPreferenceModel) -> NotificationPreference:
    return NotificationPreference(
        id=model.id,
        user_id=model.user_id,
        email_enabled=model.email_enabled,
        push_enabled=model.push_enabled,
        in_app_enabled=model.in_app_enabled,
        type_preferences=model.type_preferences or {},
        created_at=model.created_at,
        updated_at=model.updated_at,
    )
