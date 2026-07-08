from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.audit.domain.entities.audit_log import AuditLog
from app.modules.audit.domain.repositories.audit_log_repository import AuditLogRepository
from app.modules.audit.domain.value_objects import AuditLogListCriteria, AuditLogPage, SortDirection
from app.modules.audit.infrastructure.models.audit_log_model import AuditLogModel
from app.modules.audit.infrastructure.repositories.mappers import audit_log_to_entity


class SqlAlchemyAuditLogRepository(AuditLogRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _apply_filters(self, query, criteria: AuditLogListCriteria):
        if criteria.module:
            query = query.where(AuditLogModel.module == criteria.module)
        if criteria.action is not None:
            query = query.where(AuditLogModel.action == criteria.action.value)
        if criteria.user_id is not None:
            query = query.where(AuditLogModel.user_id == criteria.user_id)
        if criteria.entity:
            query = query.where(AuditLogModel.entity == criteria.entity)
        if criteria.entity_id is not None:
            query = query.where(AuditLogModel.entity_id == criteria.entity_id)
        if criteria.date_from is not None:
            query = query.where(AuditLogModel.timestamp >= criteria.date_from)
        if criteria.date_to is not None:
            query = query.where(AuditLogModel.timestamp <= criteria.date_to)
        if criteria.q:
            pattern = f"%{criteria.q}%"
            query = query.where(
                or_(
                    AuditLogModel.description.ilike(pattern),
                    AuditLogModel.user_name.ilike(pattern),
                    AuditLogModel.module.ilike(pattern),
                    AuditLogModel.entity.ilike(pattern),
                    AuditLogModel.request_id.ilike(pattern),
                )
            )
        return query

    async def create(self, audit_log: AuditLog) -> AuditLog:
        model = AuditLogModel(
            id=audit_log.id,
            timestamp=audit_log.timestamp,
            user_id=audit_log.user_id,
            user_name=audit_log.user_name,
            role=audit_log.role,
            module=audit_log.module,
            entity=audit_log.entity,
            entity_id=audit_log.entity_id,
            action=audit_log.action.value,
            description=audit_log.description,
            old_value=audit_log.old_value,
            new_value=audit_log.new_value,
            ip_address=audit_log.ip_address,
            user_agent=audit_log.user_agent,
            request_id=audit_log.request_id,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return audit_log_to_entity(model)

    async def get_by_id(self, audit_log_id: UUID) -> AuditLog | None:
        stmt = select(AuditLogModel).where(AuditLogModel.id == audit_log_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return audit_log_to_entity(model) if model else None

    async def list(self, criteria: AuditLogListCriteria) -> AuditLogPage:
        base_query = self._apply_filters(select(AuditLogModel), criteria)

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total: int = (await self._session.execute(count_stmt)).scalar_one()

        order_col = AuditLogModel.timestamp
        if criteria.sort_dir == SortDirection.ASC:
            base_query = base_query.order_by(order_col.asc())
        else:
            base_query = base_query.order_by(order_col.desc())

        offset = (criteria.page - 1) * criteria.page_size
        base_query = base_query.offset(offset).limit(criteria.page_size)

        rows = (await self._session.execute(base_query)).scalars().all()
        return AuditLogPage(
            items=[audit_log_to_entity(row) for row in rows],
            total=total,
            page=criteria.page,
            page_size=criteria.page_size,
        )

    async def list_all(self, criteria: AuditLogListCriteria, max_rows: int = 10_000) -> list[AuditLog]:
        base_query = self._apply_filters(select(AuditLogModel), criteria)
        base_query = base_query.order_by(AuditLogModel.timestamp.desc()).limit(max_rows)
        rows = (await self._session.execute(base_query)).scalars().all()
        return [audit_log_to_entity(row) for row in rows]
