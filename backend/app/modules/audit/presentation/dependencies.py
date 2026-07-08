from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.audit.application.services.audit_service import AuditService
from app.modules.audit.application.use_cases.audit_use_cases import (
    ExportAuditLogsUseCase,
    GetAuditLogUseCase,
    ListAuditLogsUseCase,
)
from app.modules.audit.domain.repositories.audit_log_repository import AuditLogRepository
from app.modules.audit.infrastructure.repositories.sqlalchemy_audit_log_repository import (
    SqlAlchemyAuditLogRepository,
)


def get_audit_log_repository(db: DbSession) -> AuditLogRepository:
    return SqlAlchemyAuditLogRepository(db)


def get_audit_service(
    repository: Annotated[AuditLogRepository, Depends(get_audit_log_repository)],
) -> AuditService:
    return AuditService(repository)


def provide_list_audit_logs_use_case(
    repository: Annotated[AuditLogRepository, Depends(get_audit_log_repository)],
) -> ListAuditLogsUseCase:
    return ListAuditLogsUseCase(repository)


def provide_get_audit_log_use_case(
    repository: Annotated[AuditLogRepository, Depends(get_audit_log_repository)],
) -> GetAuditLogUseCase:
    return GetAuditLogUseCase(repository)


def provide_export_audit_logs_use_case(
    repository: Annotated[AuditLogRepository, Depends(get_audit_log_repository)],
) -> ExportAuditLogsUseCase:
    return ExportAuditLogsUseCase(repository)


AuditServiceDep = Annotated[AuditService, Depends(get_audit_service)]
ListAuditLogsUseCaseDep = Annotated[ListAuditLogsUseCase, Depends(provide_list_audit_logs_use_case)]
GetAuditLogUseCaseDep = Annotated[GetAuditLogUseCase, Depends(provide_get_audit_log_use_case)]
ExportAuditLogsUseCaseDep = Annotated[ExportAuditLogsUseCase, Depends(provide_export_audit_logs_use_case)]

RequireAuditRead = Annotated[User, Depends(require_permission("audit:read"))]
