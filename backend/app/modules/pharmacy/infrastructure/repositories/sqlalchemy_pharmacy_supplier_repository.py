from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import select
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

    async def get_by_code(self, code: str) -> PharmacySupplier | None:
        result = await self._session.execute(
            select(PharmacySupplierModel).where(PharmacySupplierModel.code == code)
        )
        model = result.scalar_one_or_none()
        return pharmacy_supplier_to_entity(model) if model else None

    async def create(self, supplier: PharmacySupplier) -> PharmacySupplier:
        model = PharmacySupplierModel(
            id=supplier.id,
            name=supplier.name,
            code=supplier.code,
            contact_person=supplier.contact_person,
            phone=supplier.phone,
            email=supplier.email,
            address=supplier.address,
            is_active=supplier.is_active,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, supplier: PharmacySupplier) -> PharmacySupplier:
        result = await self._session.execute(
            select(PharmacySupplierModel).where(PharmacySupplierModel.id == supplier.id)
        )
        model = result.scalar_one()
        model.name = supplier.name
        model.code = supplier.code
        model.contact_person = supplier.contact_person
        model.phone = supplier.phone
        model.email = supplier.email
        model.address = supplier.address
        model.is_active = supplier.is_active
        model.updated_at = supplier.updated_at or datetime.now(UTC)
        await self._session.flush()
        updated = await self.get_by_id(supplier.id)
        assert updated is not None
        return updated
