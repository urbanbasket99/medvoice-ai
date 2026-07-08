from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.core.request_context import get_request_context
from app.modules.audit.application.dto.audit_dto import CreateAuditLogInput
from app.modules.audit.domain.entities.audit_log import AuditAction, AuditLog
from app.modules.audit.domain.repositories.audit_log_repository import AuditLogRepository


class AuditService:
    """Central audit recording service used by middleware, decorators, and modules."""

    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def record(self, data: CreateAuditLogInput) -> AuditLog:
        ctx = get_request_context()
        audit_log = AuditLog(
            id=uuid4(),
            timestamp=datetime.now(UTC),
            user_id=data.user_id or (ctx.user_id if ctx else None),
            user_name=data.user_name or (ctx.user_name if ctx else None),
            role=data.role or (", ".join(ctx.user_roles) if ctx and ctx.user_roles else None),
            module=data.module,
            entity=data.entity,
            entity_id=data.entity_id,
            action=data.action,
            description=data.description,
            old_value=data.old_value,
            new_value=data.new_value,
            ip_address=data.ip_address or (ctx.ip_address if ctx else None),
            user_agent=data.user_agent or (ctx.user_agent if ctx else None),
            request_id=data.request_id or (ctx.request_id if ctx else None),
        )
        return await self._repository.create(audit_log)

    async def record_action(
        self,
        *,
        module: str,
        entity: str,
        action: AuditAction | str,
        description: str,
        user_id: UUID | None = None,
        user_name: str | None = None,
        role: str | None = None,
        entity_id: UUID | None = None,
        old_value: dict | None = None,
        new_value: dict | None = None,
    ) -> AuditLog:
        parsed_action = action if isinstance(action, AuditAction) else AuditAction(action)
        return await self.record(
            CreateAuditLogInput(
                module=module,
                entity=entity,
                action=parsed_action,
                description=description,
                user_id=user_id,
                user_name=user_name,
                role=role,
                entity_id=entity_id,
                old_value=old_value,
                new_value=new_value,
            )
        )
