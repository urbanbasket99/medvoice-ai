"""Reusable audit decorator for use cases and route handlers."""

from collections.abc import Awaitable, Callable
from functools import wraps
from typing import Any, ParamSpec, TypeVar
from uuid import UUID

from app.modules.audit.application.dto.audit_dto import CreateAuditLogInput
from app.modules.audit.application.services.audit_service import AuditService
from app.modules.audit.domain.entities.audit_log import AuditAction

P = ParamSpec("P")
T = TypeVar("T")


def audit_action(
    *,
    module: str,
    entity: str,
    action: AuditAction,
    description: str | Callable[..., str],
    entity_id_getter: Callable[[Any], UUID | None] | None = None,
    old_value_getter: Callable[[Any], dict | None] | None = None,
    new_value_getter: Callable[[Any], dict | None] | None = None,
):
    """Decorator that records an audit log after the wrapped async function succeeds."""

    def decorator(func: Callable[P, Awaitable[T]]) -> Callable[P, Awaitable[T]]:
        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            result = await func(*args, **kwargs)

            audit_service: AuditService | None = kwargs.get("audit_service")
            if audit_service is None:
                for arg in args:
                    if isinstance(arg, AuditService):
                        audit_service = arg
                        break

            if audit_service is None:
                return result

            resolved_description = description(result) if callable(description) else description
            entity_id = entity_id_getter(result) if entity_id_getter else None
            old_value = old_value_getter(result) if old_value_getter else None
            new_value = new_value_getter(result) if new_value_getter else None

            await audit_service.record(
                CreateAuditLogInput(
                    module=module,
                    entity=entity,
                    action=action,
                    description=resolved_description,
                    entity_id=entity_id,
                    old_value=old_value,
                    new_value=new_value,
                )
            )
            return result

        return wrapper

    return decorator
