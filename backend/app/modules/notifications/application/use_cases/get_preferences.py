from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.notifications.domain.entities.notification_preference import NotificationPreference
from app.modules.notifications.domain.repositories.notification_preference_repository import (
    NotificationPreferenceRepository,
)


class GetPreferencesUseCase:
    def __init__(self, preference_repository: NotificationPreferenceRepository) -> None:
        self._preferences = preference_repository

    async def execute(self, user_id: UUID) -> NotificationPreference:
        prefs = await self._preferences.get_by_user_id(user_id)
        if prefs is not None:
            return prefs

        now = datetime.now(UTC)
        default_prefs = NotificationPreference(
            id=uuid4(),
            user_id=user_id,
            email_enabled=True,
            push_enabled=True,
            in_app_enabled=True,
            type_preferences={},
            created_at=now,
            updated_at=now,
        )
        return await self._preferences.create(default_prefs)
