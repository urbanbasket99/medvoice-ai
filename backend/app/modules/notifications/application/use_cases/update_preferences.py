from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.notifications.application.dto.notification_dto import UpdatePreferencesInput
from app.modules.notifications.domain.entities.notification_preference import NotificationPreference
from app.modules.notifications.domain.repositories.notification_preference_repository import (
    NotificationPreferenceRepository,
)


class UpdatePreferencesUseCase:
    def __init__(self, preference_repository: NotificationPreferenceRepository) -> None:
        self._preferences = preference_repository

    async def execute(self, user_id: UUID, data: UpdatePreferencesInput) -> NotificationPreference:
        now = datetime.now(UTC)
        existing = await self._preferences.get_by_user_id(user_id)

        if existing is None:
            new_prefs = NotificationPreference(
                id=uuid4(),
                user_id=user_id,
                email_enabled=data.email_enabled,
                push_enabled=data.push_enabled,
                in_app_enabled=data.in_app_enabled,
                type_preferences=data.type_preferences,
                created_at=now,
                updated_at=now,
            )
            return await self._preferences.create(new_prefs)

        updated = replace(
            existing,
            email_enabled=data.email_enabled,
            push_enabled=data.push_enabled,
            in_app_enabled=data.in_app_enabled,
            type_preferences=data.type_preferences,
            updated_at=now,
        )
        return await self._preferences.update(updated)
