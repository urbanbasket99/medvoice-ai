from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.audit.domain.entities.audit_log import AuditAction, AuditLog
from app.modules.audit.domain.value_objects import AuditLogPage


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    timestamp: datetime
    user_id: UUID | None
    user_name: str | None
    role: str | None
    module: str
    entity: str
    entity_id: UUID | None
    action: AuditAction
    description: str
    old_value: dict | None
    new_value: dict | None
    ip_address: str | None
    user_agent: str | None
    request_id: str | None

    @classmethod
    def from_entity(cls, entity: AuditLog) -> "AuditLogResponse":
        return cls(
            id=entity.id,
            timestamp=entity.timestamp,
            user_id=entity.user_id,
            user_name=entity.user_name,
            role=entity.role,
            module=entity.module,
            entity=entity.entity,
            entity_id=entity.entity_id,
            action=entity.action,
            description=entity.description,
            old_value=entity.old_value,
            new_value=entity.new_value,
            ip_address=entity.ip_address,
            user_agent=entity.user_agent,
            request_id=entity.request_id,
        )


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: AuditLogPage) -> "AuditLogListResponse":
        return cls(
            items=[AuditLogResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class AuditFilterOptionsResponse(BaseModel):
    modules: list[str]
    actions: list[str]
