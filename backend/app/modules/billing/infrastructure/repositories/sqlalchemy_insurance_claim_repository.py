from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.domain.entities.billing_entities import InsuranceClaim
from app.modules.billing.domain.repositories.insurance_claim_repository import InsuranceClaimRepository
from app.modules.billing.infrastructure.models.billing_model import InsuranceClaimModel
from app.modules.billing.infrastructure.repositories.mappers import (
    insurance_claim_to_entity,
    insurance_claim_to_model,
)


class SqlAlchemyInsuranceClaimRepository(InsuranceClaimRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, claim_id: UUID) -> InsuranceClaim | None:
        result = await self._session.execute(
            select(InsuranceClaimModel).where(InsuranceClaimModel.id == claim_id)
        )
        model = result.scalar_one_or_none()
        return insurance_claim_to_entity(model) if model else None

    async def list_by_invoice(self, invoice_id: UUID) -> list[InsuranceClaim]:
        result = await self._session.execute(
            select(InsuranceClaimModel)
            .where(InsuranceClaimModel.invoice_id == invoice_id)
            .order_by(InsuranceClaimModel.created_at)
        )
        return [insurance_claim_to_entity(m) for m in result.scalars().all()]

    async def create(self, claim: InsuranceClaim) -> InsuranceClaim:
        model = insurance_claim_to_model(claim)
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, claim: InsuranceClaim) -> InsuranceClaim:
        await self._session.execute(
            update(InsuranceClaimModel)
            .where(InsuranceClaimModel.id == claim.id)
            .values(
                claim_number=claim.claim_number,
                insurer_name=claim.insurer_name,
                status=claim.status.value,
                claimed_amount=claim.claimed_amount,
                approved_amount=claim.approved_amount,
                notes=claim.notes,
                tpa_id=claim.tpa_id,
                submitted_at=claim.submitted_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(claim.id)
        assert updated is not None
        return updated
