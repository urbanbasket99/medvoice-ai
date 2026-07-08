"""NotificationPreference entity — per-user channel and type opt-in settings."""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class NotificationPreference:
    id: UUID
    user_id: UUID
    email_enabled: bool
    push_enabled: bool
    in_app_enabled: bool
    type_preferences: dict
    created_at: datetime
    updated_at: datetime
