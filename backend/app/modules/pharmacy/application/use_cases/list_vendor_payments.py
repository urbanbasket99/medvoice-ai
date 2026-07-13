from uuid import UUID

from app.modules.pharmacy.domain.repositories.vendor_payment_repository import VendorPaymentRepository


class ListVendorPaymentsUseCase:
    def __init__(self, payment_repository: VendorPaymentRepository) -> None:
        self._payments = payment_repository

    async def execute(self, supplier_id: UUID | None = None):
        return await self._payments.list_payments(supplier_id=supplier_id)
