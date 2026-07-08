"""Notification aggregate root."""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import UUID


class NotificationType(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFORMATION = "information"
    APPOINTMENT_REMINDER = "appointment_reminder"
    BILLING_REMINDER = "billing_reminder"
    LAB_RESULT = "lab_result"
    RADIOLOGY_RESULT = "radiology_result"
    LOW_STOCK = "low_stock"
    SYSTEM_ALERT = "system_alert"


class NotificationSeverity(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFORMATION = "information"


@dataclass(slots=True)
class Notification:
    id: UUID
    user_id: UUID
    title: str
    message: str
    notification_type: NotificationType
    severity: NotificationSeverity
    is_read: bool
    created_at: datetime
    updated_at: datetime
    read_at: datetime | None = None
    action_url: str | None = None
    entity_type: str | None = None
    entity_id: UUID | None = None
    metadata: dict | None = None
    deleted_at: datetime | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
