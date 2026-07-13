from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.domain.entities.tpa import Tpa
from app.modules.billing.domain.repositories.tpa_repository import TpaRepository
from app.modules.billing.infrastructure.models.billing_model import TpaModel
from app.modules.billing.infrastructure.repositories.mappers import tpa_to_entity


class SqlAlchemyTpaRepository(TpaRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, tpa_id: UUID) -> Tpa | None:
        result = await self._session.execute(select(TpaModel).where(TpaModel.id == tpa_id))
        model = result.scalar_one_or_none()
        return tpa_to_entity(model) if model else None

    async def get_by_code(self, code: str) -> Tpa | None:
        result = await self._session.execute(
            select(TpaModel).where(TpaModel.code == code.strip().upper())
        )
        model = result.scalar_one_or_none()
        return tpa_to_entity(model) if model else None

    async def list_all(self, *, active_only: bool = False) -> list[Tpa]:
        stmt = select(TpaModel).order_by(TpaModel.name)
        if active_only:
            stmt = stmt.where(TpaModel.is_active.is_(True))
        result = await self._session.execute(stmt)
        return [tpa_to_entity(m) for m in result.scalars().all()]

    async def create(self, tpa: Tpa) -> Tpa:
        model = TpaModel(
            id=tpa.id,
            code=tpa.code,
            name=tpa.name,
            contact_person=tpa.contact_person,
            phone=tpa.phone,
            email=tpa.email,
            address=tpa.address,
            is_active=tpa.is_active,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, tpa: Tpa) -> Tpa:
        await self._session.execute(
            update(TpaModel)
            .where(TpaModel.id == tpa.id)
            .values(
                code=tpa.code,
                name=tpa.name,
                contact_person=tpa.contact_person,
                phone=tpa.phone,
                email=tpa.email,
                address=tpa.address,
                is_active=tpa.is_active,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(tpa.id)
        assert updated is not None
        return updated
