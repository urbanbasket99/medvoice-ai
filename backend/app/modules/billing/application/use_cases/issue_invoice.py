from uuid import UUID

from app.modules.billing.domain.exceptions import InvoiceNotFoundError, InvalidInvoiceStatusError
from app.modules.billing.domain.entities.billing_entities import Invoice
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import InvoiceStatus


class IssueInvoiceUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID) -> Invoice:
        invoice = await self._invoices.get_by_id(invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")
        if invoice.status != InvoiceStatus.DRAFT:
            raise InvalidInvoiceStatusError("Only draft invoices can be issued.")
        return await self._invoices.update_status(invoice_id, InvoiceStatus.ISSUED, "Invoice issued.")
