from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.domain.entities.billing_entities import Payment
from app.modules.billing.domain.repositories.payment_repository import PaymentRepository
from app.modules.billing.infrastructure.models.billing_model import PaymentModel
from app.modules.billing.infrastructure.repositories.mappers import payment_to_entity, payment_to_model


class SqlAlchemyPaymentRepository(PaymentRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, payment_id: UUID) -> Payment | None:
        result = await self._session.execute(
            select(PaymentModel).where(PaymentModel.id == payment_id)
        )
        model = result.scalar_one_or_none()
        return payment_to_entity(model) if model else None

    async def create(self, payment: Payment) -> Payment:
        model = payment_to_model(payment)
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def list_by_invoice(self, invoice_id: UUID) -> list[Payment]:
        result = await self._session.execute(
            select(PaymentModel)
            .where(PaymentModel.invoice_id == invoice_id)
            .order_by(PaymentModel.payment_date)
        )
        return [payment_to_entity(m) for m in result.scalars().all()]
