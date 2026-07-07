from uuid import UUID

from app.modules.billing.domain.exceptions import InvoiceNotFoundError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository


class DeleteInvoiceUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID) -> None:
        deleted = await self._invoices.soft_delete(invoice_id)
        if not deleted:
            raise InvoiceNotFoundError("Invoice not found.")
