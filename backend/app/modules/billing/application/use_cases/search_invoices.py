from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import InvoicePage


class SearchInvoicesUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, query: str, page: int, page_size: int) -> InvoicePage:
        return await self._invoices.search_invoices(query, page, page_size)
