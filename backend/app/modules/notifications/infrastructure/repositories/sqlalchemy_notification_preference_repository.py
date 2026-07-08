from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.domain.entities.notification_preference import NotificationPreference
from app.modules.notifications.domain.repositories.notification_preference_repository import (
    NotificationPreferenceRepository,
)
from app.modules.notifications.infrastructure.models.notification_preference_model import (
    NotificationPreferenceModel,
)
from app.modules.notifications.infrastructure.repositories.mappers import (
    notification_preference_to_entity,
)


class SqlAlchemyNotificationPreferenceRepository(NotificationPreferenceRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_user_id(self, user_id: UUID) -> NotificationPreference | None:
        stmt = select(NotificationPreferenceModel).where(
            NotificationPreferenceModel.user_id == user_id
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return notification_preference_to_entity(model) if model else None

    async def create(self, preference: NotificationPreference) -> NotificationPreference:
        model = NotificationPreferenceModel(
            id=preference.id,
            user_id=preference.user_id,
            email_enabled=preference.email_enabled,
            push_enabled=preference.push_enabled,
            in_app_enabled=preference.in_app_enabled,
            type_preferences=preference.type_preferences,
            created_at=preference.created_at,
            updated_at=preference.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return notification_preference_to_entity(model)

    async def update(self, preference: NotificationPreference) -> NotificationPreference:
        stmt = select(NotificationPreferenceModel).where(
            NotificationPreferenceModel.user_id == preference.user_id
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one()

        model.email_enabled = preference.email_enabled
        model.push_enabled = preference.push_enabled
        model.in_app_enabled = preference.in_app_enabled
        model.type_preferences = preference.type_preferences
        model.updated_at = preference.updated_at

        await self._session.flush()
        await self._session.refresh(model)
        return notification_preference_to_entity(model)
