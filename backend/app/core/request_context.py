"""Request-scoped context for cross-cutting infrastructure (audit, tracing)."""

from contextvars import ContextVar
from dataclasses import dataclass
from uuid import UUID


@dataclass(slots=True)
class RequestContext:
    request_id: str
    ip_address: str | None = None
    user_agent: str | None = None
    user_id: UUID | None = None
    user_name: str | None = None
    user_roles: list[str] | None = None


_request_context: ContextVar[RequestContext | None] = ContextVar("request_context", default=None)


def set_request_context(ctx: RequestContext) -> None:
    _request_context.set(ctx)


def get_request_context() -> RequestContext | None:
    return _request_context.get()


def clear_request_context() -> None:
    _request_context.set(None)
