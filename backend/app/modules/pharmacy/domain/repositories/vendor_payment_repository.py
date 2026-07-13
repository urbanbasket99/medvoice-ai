from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.domain.entities.vendor_payment import VendorPayment


class VendorPaymentRepository(ABC):
    @abstractmethod
    async def create(self, payment: VendorPayment) -> VendorPayment:
        raise NotImplementedError

    @abstractmethod
    async def list_payments(self, supplier_id: UUID | None = None) -> list[VendorPayment]:
        raise NotImplementedError
