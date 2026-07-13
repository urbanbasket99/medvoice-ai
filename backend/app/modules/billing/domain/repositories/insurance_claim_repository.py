from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import InsuranceClaim


class InsuranceClaimRepository(ABC):
    @abstractmethod
    async def get_by_id(self, claim_id: UUID) -> InsuranceClaim | None: ...

    @abstractmethod
    async def list_by_invoice(self, invoice_id: UUID) -> list[InsuranceClaim]: ...

    @abstractmethod
    async def create(self, claim: InsuranceClaim) -> InsuranceClaim: ...

    @abstractmethod
    async def update(self, claim: InsuranceClaim) -> InsuranceClaim: ...
