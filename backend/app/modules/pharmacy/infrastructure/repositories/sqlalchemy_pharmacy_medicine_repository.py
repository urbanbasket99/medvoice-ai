from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.value_objects import MedicineListCriteria, MedicinePage, SortDirection
from app.modules.pharmacy.infrastructure.models.pharmacy_model import PharmacyMedicineModel
from app.modules.pharmacy.infrastructure.repositories.mappers import pharmacy_medicine_to_entity

_SORT_COLUMNS = {
    "created_at": PharmacyMedicineModel.created_at,
    "generic_name": PharmacyMedicineModel.generic_name,
    "brand_name": PharmacyMedicineModel.brand_name,
    "medicine_code": PharmacyMedicineModel.medicine_code,
}


class SqlAlchemyPharmacyMedicineRepository(PharmacyMedicineRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, medicine_id: UUID) -> PharmacyMedicine | None:
        result = await self._session.execute(
            select(PharmacyMedicineModel).where(
                PharmacyMedicineModel.id == medicine_id,
                PharmacyMedicineModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        return pharmacy_medicine_to_entity(model) if model else None

    async def get_by_code(self, medicine_code: str) -> PharmacyMedicine | None:
        result = await self._session.execute(
            select(PharmacyMedicineModel).where(PharmacyMedicineModel.medicine_code == medicine_code)
        )
        model = result.scalar_one_or_none()
        return pharmacy_medicine_to_entity(model) if model else None

    async def get_by_barcode(self, barcode: str) -> PharmacyMedicine | None:
        result = await self._session.execute(
            select(PharmacyMedicineModel).where(
                PharmacyMedicineModel.barcode == barcode,
                PharmacyMedicineModel.deleted_at.is_(None),
                PharmacyMedicineModel.is_active.is_(True),
            )
        )
        model = result.scalar_one_or_none()
        return pharmacy_medicine_to_entity(model) if model else None

    async def create(self, medicine: PharmacyMedicine) -> PharmacyMedicine:
        model = PharmacyMedicineModel(
            id=medicine.id,
            medicine_code=medicine.medicine_code,
            generic_name=medicine.generic_name,
            brand_name=medicine.brand_name,
            strength=medicine.strength,
            dosage_form=medicine.dosage_form,
            manufacturer=medicine.manufacturer,
            category=medicine.category.value,
            mrp=medicine.mrp,
            selling_price=medicine.selling_price,
            gst=medicine.gst,
            barcode=medicine.barcode,
            is_active=medicine.is_active,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, medicine: PharmacyMedicine) -> PharmacyMedicine:
        await self._session.execute(
            update(PharmacyMedicineModel)
            .where(PharmacyMedicineModel.id == medicine.id)
            .values(
                generic_name=medicine.generic_name,
                brand_name=medicine.brand_name,
                strength=medicine.strength,
                dosage_form=medicine.dosage_form,
                manufacturer=medicine.manufacturer,
                category=medicine.category.value,
                mrp=medicine.mrp,
                selling_price=medicine.selling_price,
                gst=medicine.gst,
                barcode=medicine.barcode,
                is_active=medicine.is_active,
                updated_at=medicine.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(medicine.id)
        assert updated is not None
        return updated

    async def soft_delete(self, medicine_id: UUID) -> bool:
        result = await self._session.execute(
            update(PharmacyMedicineModel)
            .where(
                PharmacyMedicineModel.id == medicine_id,
                PharmacyMedicineModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now(), is_active=False)
        )
        return (result.rowcount or 0) > 0

    async def list_medicines(self, criteria: MedicineListCriteria) -> MedicinePage:
        conditions = [PharmacyMedicineModel.deleted_at.is_(None)]
        if criteria.category is not None:
            conditions.append(PharmacyMedicineModel.category == criteria.category.value)
        if criteria.is_active is not None:
            conditions.append(PharmacyMedicineModel.is_active == criteria.is_active)

        count_stmt = select(func.count()).select_from(PharmacyMedicineModel).where(and_(*conditions))
        total = int((await self._session.execute(count_stmt)).scalar_one())

        sort_col = _SORT_COLUMNS.get(criteria.sort_by.value, PharmacyMedicineModel.created_at)
        order = sort_col.desc() if criteria.sort_dir == SortDirection.DESC else sort_col.asc()
        offset = (criteria.page - 1) * criteria.page_size

        stmt = (
            select(PharmacyMedicineModel)
            .where(and_(*conditions))
            .order_by(order)
            .offset(offset)
            .limit(criteria.page_size)
        )
        result = await self._session.execute(stmt)
        items = [pharmacy_medicine_to_entity(m) for m in result.scalars().all()]
        return MedicinePage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_medicines(self, query: str, page: int, page_size: int) -> MedicinePage:
        pattern = f"%{query}%"
        conditions = [
            PharmacyMedicineModel.deleted_at.is_(None),
            or_(
                PharmacyMedicineModel.medicine_code.ilike(pattern),
                PharmacyMedicineModel.generic_name.ilike(pattern),
                PharmacyMedicineModel.brand_name.ilike(pattern),
                PharmacyMedicineModel.barcode.ilike(pattern),
            ),
        ]

        count_stmt = select(func.count()).select_from(PharmacyMedicineModel).where(and_(*conditions))
        total = int((await self._session.execute(count_stmt)).scalar_one())
        offset = (page - 1) * page_size

        stmt = (
            select(PharmacyMedicineModel)
            .where(and_(*conditions))
            .order_by(PharmacyMedicineModel.generic_name.asc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self._session.execute(stmt)
        items = [pharmacy_medicine_to_entity(m) for m in result.scalars().all()]
        return MedicinePage(items=items, total=total, page=page, page_size=page_size)
