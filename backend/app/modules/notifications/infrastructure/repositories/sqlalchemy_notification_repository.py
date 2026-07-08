from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.domain.entities.notification import Notification
from app.modules.notifications.domain.repositories.notification_repository import NotificationRepository
from app.modules.notifications.domain.value_objects import (
    NotificationListCriteria,
    NotificationPage,
    SortDirection,
)
from app.modules.notifications.infrastructure.models.notification_model import NotificationModel
from app.modules.notifications.infrastructure.repositories.mappers import notification_to_entity


class SqlAlchemyNotificationRepository(NotificationRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, notification_id: UUID, user_id: UUID) -> Notification | None:
        stmt = select(NotificationModel).where(
            NotificationModel.id == notification_id,
            NotificationModel.user_id == user_id,
            NotificationModel.deleted_at.is_(None),
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return notification_to_entity(model) if model else None

    async def list(self, criteria: NotificationListCriteria) -> NotificationPage:
        base_query = select(NotificationModel).where(
            NotificationModel.user_id == criteria.user_id,
            NotificationModel.deleted_at.is_(None),
        )

        if criteria.notification_type is not None:
            base_query = base_query.where(
                NotificationModel.notification_type == criteria.notification_type.value
            )
        if criteria.is_read is not None:
            base_query = base_query.where(NotificationModel.is_read == criteria.is_read)
        if criteria.q:
            pattern = f"%{criteria.q}%"
            base_query = base_query.where(
                or_(
                    NotificationModel.title.ilike(pattern),
                    NotificationModel.message.ilike(pattern),
                )
            )

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total: int = (await self._session.execute(count_stmt)).scalar_one()

        order_col = NotificationModel.created_at
        if criteria.sort_dir == SortDirection.ASC:
            base_query = base_query.order_by(order_col.asc())
        else:
            base_query = base_query.order_by(order_col.desc())

        offset = (criteria.page - 1) * criteria.page_size
        base_query = base_query.offset(offset).limit(criteria.page_size)

        rows = (await self._session.execute(base_query)).scalars().all()
        return NotificationPage(
            items=[notification_to_entity(row) for row in rows],
            total=total,
            page=criteria.page,
            page_size=criteria.page_size,
        )

    async def get_unread_count(self, user_id: UUID) -> int:
        stmt = select(func.count()).where(
            NotificationModel.user_id == user_id,
            NotificationModel.is_read.is_(False),
            NotificationModel.deleted_at.is_(None),
        )
        return (await self._session.execute(stmt)).scalar_one()

    async def create(self, notification: Notification) -> Notification:
        model = NotificationModel(
            id=notification.id,
            user_id=notification.user_id,
            title=notification.title,
            message=notification.message,
            notification_type=notification.notification_type.value,
            severity=notification.severity.value,
            is_read=notification.is_read,
            read_at=notification.read_at,
            action_url=notification.action_url,
            entity_type=notification.entity_type,
            entity_id=notification.entity_id,
            notification_metadata=notification.metadata,
            created_at=notification.created_at,
            updated_at=notification.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return notification_to_entity(model)

    async def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Notification | None:
        now = datetime.now(UTC)
        stmt = (
            update(NotificationModel)
            .where(
                NotificationModel.id == notification_id,
                NotificationModel.user_id == user_id,
                NotificationModel.deleted_at.is_(None),
            )
            .values(is_read=True, read_at=now, updated_at=now)
            .returning(NotificationModel)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return notification_to_entity(model) if model else None

    async def mark_all_as_read(self, user_id: UUID) -> int:
        now = datetime.now(UTC)
        stmt = (
            update(NotificationModel)
            .where(
                NotificationModel.user_id == user_id,
                NotificationModel.is_read.is_(False),
                NotificationModel.deleted_at.is_(None),
            )
            .values(is_read=True, read_at=now, updated_at=now)
        )
        result = await self._session.execute(stmt)
        return result.rowcount or 0

    async def soft_delete(self, notification_id: UUID, user_id: UUID) -> bool:
        now = datetime.now(UTC)
        stmt = (
            update(NotificationModel)
            .where(
                NotificationModel.id == notification_id,
                NotificationModel.user_id == user_id,
                NotificationModel.deleted_at.is_(None),
            )
            .values(deleted_at=now, updated_at=now)
        )
        result = await self._session.execute(stmt)
        return (result.rowcount or 0) > 0
