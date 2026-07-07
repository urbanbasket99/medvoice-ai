from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import InvoiceListCriteria, InvoicePage


class GetInvoicesUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, criteria: InvoiceListCriteria) -> InvoicePage:
        return await self._invoices.list_invoices(criteria)
