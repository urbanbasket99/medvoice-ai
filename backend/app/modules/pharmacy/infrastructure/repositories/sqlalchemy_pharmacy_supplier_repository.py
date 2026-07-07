from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pharmacy.domain.entities.pharmacy_supplier import PharmacySupplier
from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository
from app.modules.pharmacy.infrastructure.models.pharmacy_model import PharmacySupplierModel
from app.modules.pharmacy.infrastructure.repositories.mappers import pharmacy_supplier_to_entity


class SqlAlchemyPharmacySupplierRepository(PharmacySupplierRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_suppliers(self, active_only: bool = True) -> list[PharmacySupplier]:
        stmt = select(PharmacySupplierModel).order_by(PharmacySupplierModel.name.asc())
        if active_only:
            stmt = stmt.where(PharmacySupplierModel.is_active.is_(True))
        result = await self._session.execute(stmt)
        return [pharmacy_supplier_to_entity(m) for m in result.scalars().all()]

    async def get_by_id(self, supplier_id: UUID) -> PharmacySupplier | None:
        result = await self._session.execute(
            select(PharmacySupplierModel).where(PharmacySupplierModel.id == supplier_id)
        )
        model = result.scalar_one_or_none()
        return pharmacy_supplier_to_entity(model) if model else None
