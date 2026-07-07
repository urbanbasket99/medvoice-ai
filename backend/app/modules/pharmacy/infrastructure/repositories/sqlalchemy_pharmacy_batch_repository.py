from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.pharmacy.domain.entities.pharmacy_batch import PharmacyBatch
from app.modules.pharmacy.domain.repositories.pharmacy_batch_repository import PharmacyBatchRepository
from app.modules.pharmacy.infrastructure.models.pharmacy_model import (
    PharmacyBatchModel,
    PharmacyMedicineModel,
    PharmacySupplierModel,
)
from app.modules.pharmacy.infrastructure.repositories.mappers import pharmacy_batch_to_entity


class SqlAlchemyPharmacyBatchRepository(PharmacyBatchRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        supplier = aliased(PharmacySupplierModel)
        medicine = aliased(PharmacyMedicineModel)
        stmt = (
            select(PharmacyBatchModel, supplier, medicine)
            .outerjoin(supplier, PharmacyBatchModel.supplier_id == supplier.id)
            .join(medicine, PharmacyBatchModel.medicine_id == medicine.id)
        )
        return stmt, supplier, medicine

    async def get_by_id(self, batch_id: UUID) -> PharmacyBatch | None:
        stmt, supplier, medicine = self._base_select()
        result = await self._session.execute(stmt.where(PharmacyBatchModel.id == batch_id))
        row = result.first()
        if not row:
            return None
        model, sup, med = row
        return pharmacy_batch_to_entity(model, sup, med)

    async def create(self, batch: PharmacyBatch) -> PharmacyBatch:
        model = PharmacyBatchModel(
            id=batch.id,
            medicine_id=batch.medicine_id,
            batch_number=batch.batch_number,
            expiry_date=batch.expiry_date,
            quantity=batch.quantity,
            purchase_price=batch.purchase_price,
            selling_price=batch.selling_price,
            supplier_id=batch.supplier_id,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, batch: PharmacyBatch) -> PharmacyBatch:
        await self._session.execute(
            update(PharmacyBatchModel)
            .where(PharmacyBatchModel.id == batch.id)
            .values(
                batch_number=batch.batch_number,
                expiry_date=batch.expiry_date,
                quantity=batch.quantity,
                purchase_price=batch.purchase_price,
                selling_price=batch.selling_price,
                supplier_id=batch.supplier_id,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(batch.id)
        assert updated is not None
        return updated

    async def list_by_medicine(self, medicine_id: UUID) -> list[PharmacyBatch]:
        stmt, supplier, medicine = self._base_select()
        result = await self._session.execute(
            stmt.where(PharmacyBatchModel.medicine_id == medicine_id).order_by(
                PharmacyBatchModel.expiry_date.asc()
            )
        )
        return [pharmacy_batch_to_entity(row[0], row[1], row[2]) for row in result.all()]

    async def decrement_quantity(self, batch_id: UUID, quantity: int) -> bool:
        result = await self._session.execute(
            update(PharmacyBatchModel)
            .where(
                PharmacyBatchModel.id == batch_id,
                PharmacyBatchModel.quantity >= quantity,
            )
            .values(quantity=PharmacyBatchModel.quantity - quantity)
        )
        return (result.rowcount or 0) > 0
