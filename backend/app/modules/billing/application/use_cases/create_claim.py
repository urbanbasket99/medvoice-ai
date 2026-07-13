from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.billing.application.dto.billing_dto import CreateClaimInput
from app.modules.billing.domain.entities.billing_entities import InsuranceClaim
from app.modules.billing.domain.exceptions import InvoiceNotFoundError
from app.modules.billing.domain.repositories.insurance_claim_repository import InsuranceClaimRepository
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import ClaimStatus


class CreateClaimUseCase:
    def __init__(
        self,
        claim_repository: InsuranceClaimRepository,
        invoice_repository: InvoiceRepository,
    ) -> None:
        self._claims = claim_repository
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID, data: CreateClaimInput) -> InsuranceClaim:
        invoice = await self._invoices.get_by_id(invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")

        now = datetime.now(UTC)
        status = ClaimStatus(data.status)
        submitted_at = now if status == ClaimStatus.SUBMITTED else None

        claim = InsuranceClaim(
            id=uuid4(),
            invoice_id=invoice_id,
            claim_number=data.claim_number,
            insurer_name=data.insurer_name,
            status=status,
            claimed_amount=data.claimed_amount,
            approved_amount=data.approved_amount,
            notes=data.notes,
            tpa_id=data.tpa_id,
            submitted_at=submitted_at,
            created_at=now,
            updated_at=now,
        )
        return await self._claims.create(claim)
