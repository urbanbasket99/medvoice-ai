from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.repositories.ward_repository import WardRepository
from app.modules.ipd.domain.value_objects import SortDirection, WardListCriteria, WardPage
from app.modules.ipd.infrastructure.models.ipd_model import IpdWardModel
from app.modules.ipd.infrastructure.repositories.mappers import ward_to_entity

_SORT_COLUMNS = {
    "created_at": IpdWardModel.created_at,
    "updated_at": IpdWardModel.updated_at,
    "code": IpdWardModel.code,
    "name": IpdWardModel.name,
}


class SqlAlchemyWardRepository(WardRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, ward_id: UUID) -> Ward | None:
        result = await self._session.execute(
            select(IpdWardModel).where(
                IpdWardModel.id == ward_id,
                IpdWardModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        return ward_to_entity(model) if model else None

    async def get_by_code(self, code: str) -> Ward | None:
        result = await self._session.execute(
            select(IpdWardModel).where(
                func.lower(IpdWardModel.code) == code.strip().lower(),
                IpdWardModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        return ward_to_entity(model) if model else None

    async def create(self, ward: Ward) -> Ward:
        model = IpdWardModel(
            id=ward.id,
            code=ward.code,
            name=ward.name,
            ward_type=ward.ward_type.value,
            floor=ward.floor,
            is_active=ward.is_active,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, ward: Ward) -> Ward:
        await self._session.execute(
            update(IpdWardModel)
            .where(IpdWardModel.id == ward.id)
            .values(
                code=ward.code,
                name=ward.name,
                ward_type=ward.ward_type.value,
                floor=ward.floor,
                is_active=ward.is_active,
                updated_at=ward.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(ward.id)
        assert updated is not None
        return updated

    async def soft_delete(self, ward_id: UUID) -> bool:
        result = await self._session.execute(
            update(IpdWardModel)
            .where(
                IpdWardModel.id == ward_id,
                IpdWardModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_wards(self, criteria: WardListCriteria) -> WardPage:
        conditions = [IpdWardModel.deleted_at.is_(None)]
        if criteria.ward_type is not None:
            conditions.append(IpdWardModel.ward_type == criteria.ward_type.value)
        if criteria.is_active is not None:
            conditions.append(IpdWardModel.is_active.is_(criteria.is_active))
        if criteria.search:
            pattern = f"%{criteria.search.strip()}%"
            conditions.append(
                or_(
                    IpdWardModel.code.ilike(pattern),
                    IpdWardModel.name.ilike(pattern),
                    IpdWardModel.floor.ilike(pattern),
                )
            )

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, IpdWardModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        total = (
            await self._session.execute(
                select(func.count()).select_from(IpdWardModel).where(and_(*conditions))
            )
        ).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            select(IpdWardModel)
            .where(and_(*conditions))
            .order_by(order)
            .offset(offset)
            .limit(criteria.page_size)
        )
        items = [ward_to_entity(item) for item in result.scalars().all()]
        return WardPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)
