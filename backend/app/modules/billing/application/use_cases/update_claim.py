from datetime import UTC, datetime
from uuid import UUID

from app.modules.billing.application.dto.billing_dto import UpdateClaimInput
from app.modules.billing.domain.entities.billing_entities import InsuranceClaim
from app.modules.billing.domain.exceptions import InsuranceClaimNotFoundError
from app.modules.billing.domain.repositories.insurance_claim_repository import InsuranceClaimRepository
from app.modules.billing.domain.value_objects import ClaimStatus


class UpdateClaimUseCase:
    def __init__(self, claim_repository: InsuranceClaimRepository) -> None:
        self._claims = claim_repository

    async def execute(self, claim_id: UUID, data: UpdateClaimInput) -> InsuranceClaim:
        existing = await self._claims.get_by_id(claim_id)
        if existing is None:
            raise InsuranceClaimNotFoundError("Insurance claim not found.")

        now = datetime.now(UTC)
        status = ClaimStatus(data.status)
        submitted_at = existing.submitted_at
        if status == ClaimStatus.SUBMITTED and submitted_at is None:
            submitted_at = now

        existing.claim_number = data.claim_number
        existing.insurer_name = data.insurer_name
        existing.status = status
        existing.claimed_amount = data.claimed_amount
        existing.approved_amount = data.approved_amount
        existing.notes = data.notes
        existing.tpa_id = data.tpa_id
        existing.submitted_at = submitted_at
        existing.updated_at = now
        return await self._claims.update(existing)
