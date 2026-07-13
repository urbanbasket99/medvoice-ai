from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.repositories.bed_repository import BedRepository
from app.modules.ipd.domain.value_objects import BedListCriteria, BedPage, BedStatus, SortDirection
from app.modules.ipd.infrastructure.models.ipd_model import IpdBedModel, IpdWardModel
from app.modules.ipd.infrastructure.repositories.mappers import bed_to_entity

_SORT_COLUMNS = {
    "created_at": IpdBedModel.created_at,
    "updated_at": IpdBedModel.updated_at,
    "bed_number": IpdBedModel.bed_number,
    "status": IpdBedModel.status,
}


class SqlAlchemyBedRepository(BedRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        stmt = select(IpdBedModel, IpdWardModel).join(IpdWardModel, IpdBedModel.ward_id == IpdWardModel.id)
        return stmt, IpdWardModel

    def _map_row(self, row) -> Bed:
        model, ward = row
        return bed_to_entity(model, ward)

    async def get_by_id(self, bed_id: UUID) -> Bed | None:
        stmt, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                IpdBedModel.id == bed_id,
                IpdBedModel.deleted_at.is_(None),
                IpdWardModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, bed: Bed) -> Bed:
        model = IpdBedModel(
            id=bed.id,
            ward_id=bed.ward_id,
            bed_number=bed.bed_number,
            status=bed.status.value,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, bed: Bed) -> Bed:
        await self._session.execute(
            update(IpdBedModel)
            .where(IpdBedModel.id == bed.id)
            .values(
                ward_id=bed.ward_id,
                bed_number=bed.bed_number,
                status=bed.status.value,
                updated_at=bed.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(bed.id)
        assert updated is not None
        return updated

    async def soft_delete(self, bed_id: UUID) -> bool:
        result = await self._session.execute(
            update(IpdBedModel)
            .where(
                IpdBedModel.id == bed_id,
                IpdBedModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_beds(self, criteria: BedListCriteria) -> BedPage:
        stmt, _ = self._base_select()
        conditions = [IpdBedModel.deleted_at.is_(None), IpdWardModel.deleted_at.is_(None)]
        if criteria.ward_id is not None:
            conditions.append(IpdBedModel.ward_id == criteria.ward_id)
        if criteria.status is not None:
            conditions.append(IpdBedModel.status == criteria.status.value)
        if criteria.search:
            pattern = f"%{criteria.search.strip()}%"
            conditions.append(
                or_(
                    IpdBedModel.bed_number.ilike(pattern),
                    IpdWardModel.code.ilike(pattern),
                    IpdWardModel.name.ilike(pattern),
                )
            )

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, IpdBedModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        total = (
            await self._session.execute(
                select(func.count())
                .select_from(IpdBedModel)
                .join(IpdWardModel, IpdBedModel.ward_id == IpdWardModel.id)
                .where(and_(*conditions))
            )
        ).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return BedPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def list_available(self, ward_id: UUID | None = None) -> list[Bed]:
        stmt, _ = self._base_select()
        conditions = [
            IpdBedModel.deleted_at.is_(None),
            IpdWardModel.deleted_at.is_(None),
            IpdBedModel.status == BedStatus.AVAILABLE.value,
        ]
        if ward_id is not None:
            conditions.append(IpdBedModel.ward_id == ward_id)

        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(IpdWardModel.name.asc(), IpdBedModel.bed_number.asc())
        )
        return [self._map_row(row) for row in result.all()]

    async def ward_exists(self, ward_id: UUID) -> bool:
        result = await self._session.execute(
            select(IpdWardModel.id).where(
                IpdWardModel.id == ward_id,
                IpdWardModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None
