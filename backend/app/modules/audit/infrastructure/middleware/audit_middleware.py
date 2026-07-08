import asyncio
import logging
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.request_context import RequestContext, clear_request_context, set_request_context
from app.db.session import AsyncSessionLocal
from app.domain.exceptions import InvalidAccessTokenError
from app.infrastructure.security.jwt_service import JwtTokenService
from app.modules.audit.application.dto.audit_dto import CreateAuditLogInput
from app.modules.audit.application.services.audit_service import AuditService
from app.modules.audit.infrastructure.path_mapper import (
    build_description,
    extract_entity_id,
    infer_action,
    infer_module_and_entity,
)
from app.modules.audit.infrastructure.repositories.sqlalchemy_audit_log_repository import (
    SqlAlchemyAuditLogRepository,
)

logger = logging.getLogger(__name__)

_SKIP_PREFIXES = (
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
)

_SKIP_EXACT = {
    "/api/v1/audit/logs",
}


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def _should_skip(path: str, method: str) -> bool:
    if method == "OPTIONS":
        return True
    if any(path.startswith(prefix) for prefix in _SKIP_PREFIXES):
        return True
    if path.startswith("/api/v1/audit/logs"):
        return True
    if path in _SKIP_EXACT:
        return True
    return False


def _decode_user(request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None, None, None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = JwtTokenService().decode_access_token(token)
    except InvalidAccessTokenError:
        return None, None, None

    return payload.user_id, None, payload.roles


class AuditMiddleware(BaseHTTPMiddleware):
    """Automatically records audit entries for API requests without touching business modules."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("x-request-id") or str(uuid4())
        request.state.request_id = request_id

        user_id, user_name, roles = _decode_user(request)
        ctx = RequestContext(
            request_id=request_id,
            ip_address=_client_ip(request),
            user_agent=request.headers.get("user-agent"),
            user_id=user_id,
            user_name=user_name,
            user_roles=roles,
        )
        set_request_context(ctx)

        try:
            response = await call_next(request)
        finally:
            clear_request_context()

        path = request.url.path
        if not _should_skip(path, request.method) and path.startswith("/api/v1"):
            asyncio.create_task(
                self._record_async(
                    method=request.method,
                    path=path,
                    status_code=response.status_code,
                    ctx=ctx,
                )
            )

        response.headers["X-Request-ID"] = request_id
        return response

    async def _record_async(self, *, method: str, path: str, status_code: int, ctx: RequestContext) -> None:
        if status_code >= 500:
            return

        action = infer_action(method, path)
        module, entity = infer_module_and_entity(path)
        entity_id = extract_entity_id(path)
        description = build_description(method, path, action, status_code)

        try:
            async with AsyncSessionLocal() as session:
                repository = SqlAlchemyAuditLogRepository(session)
                service = AuditService(repository)
                await service.record(
                    CreateAuditLogInput(
                        module=module,
                        entity=entity,
                        action=action,
                        description=description,
                        user_id=ctx.user_id,
                        user_name=ctx.user_name,
                        role=", ".join(ctx.user_roles) if ctx.user_roles else None,
                        entity_id=entity_id,
                        ip_address=ctx.ip_address,
                        user_agent=ctx.user_agent,
                        request_id=ctx.request_id,
                        new_value={"method": method, "path": path, "status_code": status_code},
                    )
                )
                await session.commit()
        except Exception:
            logger.exception("Failed to record audit log for %s %s", method, path)
