from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pharmacy.domain.entities.vendor_payment import VendorPayment
from app.modules.pharmacy.domain.repositories.vendor_payment_repository import VendorPaymentRepository
from app.modules.pharmacy.infrastructure.models.pharmacy_model import PharmacySupplierModel, VendorPaymentModel
from app.modules.pharmacy.infrastructure.repositories.mappers import vendor_payment_to_entity


class SqlAlchemyVendorPaymentRepository(VendorPaymentRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, payment: VendorPayment) -> VendorPayment:
        model = VendorPaymentModel(
            id=payment.id,
            payment_number=payment.payment_number,
            supplier_id=payment.supplier_id,
            amount=payment.amount,
            payment_date=payment.payment_date,
            payment_method=payment.payment_method.value,
            reference_number=payment.reference_number,
            notes=payment.notes,
            created_by=payment.created_by,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self._get_by_id(model.id)
        assert created is not None
        return created

    async def list_payments(self, supplier_id: UUID | None = None) -> list[VendorPayment]:
        stmt = (
            select(VendorPaymentModel, PharmacySupplierModel)
            .join(PharmacySupplierModel, VendorPaymentModel.supplier_id == PharmacySupplierModel.id)
            .order_by(VendorPaymentModel.payment_date.desc(), VendorPaymentModel.created_at.desc())
        )
        if supplier_id is not None:
            stmt = stmt.where(VendorPaymentModel.supplier_id == supplier_id)
        result = await self._session.execute(stmt)
        return [vendor_payment_to_entity(row[0], row[1]) for row in result.all()]

    async def _get_by_id(self, payment_id: UUID) -> VendorPayment | None:
        result = await self._session.execute(
            select(VendorPaymentModel, PharmacySupplierModel)
            .join(PharmacySupplierModel, VendorPaymentModel.supplier_id == PharmacySupplierModel.id)
            .where(VendorPaymentModel.id == payment_id)
        )
        row = result.first()
        return vendor_payment_to_entity(row[0], row[1]) if row else None
