from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import InsuranceClaim
from app.modules.billing.domain.exceptions import InvoiceNotFoundError
from app.modules.billing.domain.repositories.insurance_claim_repository import InsuranceClaimRepository
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository


class ListClaimsByInvoiceUseCase:
    def __init__(
        self,
        claim_repository: InsuranceClaimRepository,
        invoice_repository: InvoiceRepository,
    ) -> None:
        self._claims = claim_repository
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID) -> list[InsuranceClaim]:
        invoice = await self._invoices.get_by_id(invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")
        return await self._claims.list_by_invoice(invoice_id)
