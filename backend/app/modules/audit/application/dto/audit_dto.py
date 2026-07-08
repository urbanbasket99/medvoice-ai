from dataclasses import dataclass
from uuid import UUID

from app.modules.audit.domain.entities.audit_log import AuditAction


@dataclass(slots=True)
class CreateAuditLogInput:
    module: str
    entity: str
    action: AuditAction
    description: str
    user_id: UUID | None = None
    user_name: str | None = None
    role: str | None = None
    entity_id: UUID | None = None
    old_value: dict | None = None
    new_value: dict | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    request_id: str | None = None
