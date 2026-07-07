from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import Payment
from app.modules.billing.domain.exceptions import PaymentNotFoundError
from app.modules.billing.domain.repositories.payment_repository import PaymentRepository


class GetPaymentUseCase:
    def __init__(self, payment_repository: PaymentRepository) -> None:
        self._payments = payment_repository

    async def execute(self, payment_id: UUID) -> Payment:
        payment = await self._payments.get_by_id(payment_id)
        if payment is None:
            raise PaymentNotFoundError("Payment not found.")
        return payment
