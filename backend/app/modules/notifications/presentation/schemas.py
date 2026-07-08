from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.notifications.domain.entities.notification import (
    Notification,
    NotificationSeverity,
    NotificationType,
)
from app.modules.notifications.domain.entities.notification_preference import NotificationPreference
from app.modules.notifications.domain.value_objects import NotificationPage


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    message: str
    notification_type: NotificationType
    severity: NotificationSeverity
    is_read: bool
    read_at: datetime | None
    action_url: str | None
    entity_type: str | None
    entity_id: UUID | None
    metadata: dict | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, notification: Notification) -> "NotificationResponse":
        return cls(
            id=notification.id,
            user_id=notification.user_id,
            title=notification.title,
            message=notification.message,
            notification_type=notification.notification_type,
            severity=notification.severity,
            is_read=notification.is_read,
            read_at=notification.read_at,
            action_url=notification.action_url,
            entity_type=notification.entity_type,
            entity_id=notification.entity_id,
            metadata=notification.metadata,
            created_at=notification.created_at,
            updated_at=notification.updated_at,
        )


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: NotificationPage) -> "NotificationListResponse":
        return cls(
            items=[NotificationResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class UnreadCountResponse(BaseModel):
    count: int


class MarkAllReadResponse(BaseModel):
    marked: int


class NotificationCreateRequest(BaseModel):
    user_id: UUID
    title: str = Field(max_length=200)
    message: str
    notification_type: NotificationType
    severity: NotificationSeverity = NotificationSeverity.INFORMATION
    action_url: str | None = Field(default=None, max_length=500)
    entity_type: str | None = Field(default=None, max_length=50)
    entity_id: UUID | None = None
    metadata: dict | None = None


class NotificationPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    email_enabled: bool
    push_enabled: bool
    in_app_enabled: bool
    type_preferences: dict
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, preference: NotificationPreference) -> "NotificationPreferenceResponse":
        return cls(
            id=preference.id,
            user_id=preference.user_id,
            email_enabled=preference.email_enabled,
            push_enabled=preference.push_enabled,
            in_app_enabled=preference.in_app_enabled,
            type_preferences=preference.type_preferences,
            created_at=preference.created_at,
            updated_at=preference.updated_at,
        )


class UpdatePreferencesRequest(BaseModel):
    email_enabled: bool = True
    push_enabled: bool = True
    in_app_enabled: bool = True
    type_preferences: dict = Field(default_factory=dict)
