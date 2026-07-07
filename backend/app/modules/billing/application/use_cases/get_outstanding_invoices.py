from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import InvoicePage


class GetOutstandingInvoicesUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, page: int, page_size: int) -> InvoicePage:
        return await self._invoices.list_outstanding(page, page_size)
