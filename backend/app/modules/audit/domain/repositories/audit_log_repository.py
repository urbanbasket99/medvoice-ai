from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.audit.domain.entities.audit_log import AuditLog
from app.modules.audit.domain.value_objects import AuditLogListCriteria, AuditLogPage


class AuditLogRepository(ABC):
    @abstractmethod
    async def create(self, audit_log: AuditLog) -> AuditLog:
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, audit_log_id: UUID) -> AuditLog | None:
        raise NotImplementedError

    @abstractmethod
    async def list(self, criteria: AuditLogListCriteria) -> AuditLogPage:
        raise NotImplementedError

    @abstractmethod
    async def list_all(self, criteria: AuditLogListCriteria, max_rows: int = 10_000) -> list[AuditLog]:
        raise NotImplementedError
