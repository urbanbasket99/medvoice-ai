from app.modules.audit.domain.entities.audit_log import AuditAction, AuditLog
from app.modules.audit.infrastructure.models.audit_log_model import AuditLogModel


def audit_log_to_entity(model: AuditLogModel) -> AuditLog:
    return AuditLog(
        id=model.id,
        timestamp=model.timestamp,
        user_id=model.user_id,
        user_name=model.user_name,
        role=model.role,
        module=model.module,
        entity=model.entity,
        entity_id=model.entity_id,
        action=AuditAction(model.action),
        description=model.description,
        old_value=model.old_value,
        new_value=model.new_value,
        ip_address=model.ip_address,
        user_agent=model.user_agent,
        request_id=model.request_id,
    )
