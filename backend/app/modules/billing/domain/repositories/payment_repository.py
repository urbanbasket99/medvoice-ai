from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import Payment


class PaymentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, payment_id: UUID) -> Payment | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, payment: Payment) -> Payment:
        raise NotImplementedError

    @abstractmethod
    async def list_by_invoice(self, invoice_id: UUID) -> list[Payment]:
        raise NotImplementedError
