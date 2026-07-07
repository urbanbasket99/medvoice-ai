from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import Invoice
from app.modules.billing.domain.value_objects import InvoiceListCriteria, InvoicePage, InvoiceStatus


class InvoiceRepository(ABC):
    @abstractmethod
    async def get_by_id(self, invoice_id: UUID) -> Invoice | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, invoice: Invoice) -> Invoice:
        raise NotImplementedError

    @abstractmethod
    async def update(self, invoice: Invoice) -> Invoice:
        raise NotImplementedError

    @abstractmethod
    async def update_status(
        self,
        invoice_id: UUID,
        status: InvoiceStatus,
        notes: str | None = None,
    ) -> Invoice:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, invoice_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_invoices(self, criteria: InvoiceListCriteria) -> InvoicePage:
        raise NotImplementedError

    @abstractmethod
    async def search_invoices(self, query: str, page: int, page_size: int) -> InvoicePage:
        raise NotImplementedError

    @abstractmethod
    async def list_outstanding(self, page: int, page_size: int) -> InvoicePage:
        raise NotImplementedError
