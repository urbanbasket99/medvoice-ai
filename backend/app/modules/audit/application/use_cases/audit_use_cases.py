from uuid import UUID

from app.modules.audit.domain.exceptions import AuditLogNotFoundError
from app.modules.audit.domain.repositories.audit_log_repository import AuditLogRepository
from app.modules.audit.domain.value_objects import AuditLogListCriteria, AuditLogPage


class ListAuditLogsUseCase:
    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def execute(self, criteria: AuditLogListCriteria) -> AuditLogPage:
        return await self._repository.list(criteria)


class GetAuditLogUseCase:
    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def execute(self, audit_log_id: UUID):
        audit_log = await self._repository.get_by_id(audit_log_id)
        if audit_log is None:
            raise AuditLogNotFoundError(f"Audit log {audit_log_id} not found.")
        return audit_log


class ExportAuditLogsUseCase:
    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def execute(self, criteria: AuditLogListCriteria, max_rows: int = 10_000):
        return await self._repository.list_all(criteria, max_rows=max_rows)
