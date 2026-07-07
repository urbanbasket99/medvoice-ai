from uuid import UUID

from app.modules.billing.domain.entities.billing_entities import Payment
from app.modules.billing.domain.repositories.payment_repository import PaymentRepository


class GetPaymentsUseCase:
    def __init__(self, payment_repository: PaymentRepository) -> None:
        self._payments = payment_repository

    async def execute(self, invoice_id: UUID) -> list[Payment]:
        return await self._payments.list_by_invoice(invoice_id)
