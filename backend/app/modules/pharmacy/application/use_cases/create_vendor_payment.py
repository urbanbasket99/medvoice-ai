from datetime import UTC, datetime
from uuid import uuid4

from app.modules.pharmacy.application.dto.pharmacy_dto import CreateVendorPaymentInput
from app.modules.pharmacy.application.interfaces.vendor_payment_number_generator import (
    VendorPaymentNumberGenerator,
)
from app.modules.pharmacy.domain.entities.vendor_payment import VendorPayment
from app.modules.pharmacy.domain.exceptions import PharmacySupplierNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository
from app.modules.pharmacy.domain.repositories.vendor_payment_repository import VendorPaymentRepository


class CreateVendorPaymentUseCase:
    def __init__(
        self,
        payment_repository: VendorPaymentRepository,
        supplier_repository: PharmacySupplierRepository,
        payment_number_generator: VendorPaymentNumberGenerator,
    ) -> None:
        self._payments = payment_repository
        self._suppliers = supplier_repository
        self._payment_numbers = payment_number_generator

    async def execute(self, data: CreateVendorPaymentInput) -> VendorPayment:
        supplier = await self._suppliers.get_by_id(data.supplier_id)
        if supplier is None:
            raise PharmacySupplierNotFoundError("Supplier not found.")

        now = datetime.now(UTC)
        payment = VendorPayment(
            id=uuid4(),
            payment_number=await self._payment_numbers.generate(),
            supplier_id=data.supplier_id,
            amount=data.amount,
            payment_date=data.payment_date,
            payment_method=data.payment_method,
            created_at=now,
            reference_number=data.reference_number,
            notes=data.notes,
            created_by=data.created_by,
            supplier_name=supplier.name,
        )
        return await self._payments.create(payment)
