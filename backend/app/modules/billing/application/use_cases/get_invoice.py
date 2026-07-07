from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import Invoice
from app.modules.billing.domain.exceptions import InvoiceNotFoundError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository


class GetInvoiceUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID) -> Invoice:
        invoice = await self._invoices.get_by_id(invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")
        return invoice
