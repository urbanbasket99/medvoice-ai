from uuid import UUID

from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.prescriptions.domain.entities.medicine_master import MedicineMaster
from app.modules.prescriptions.domain.repositories.medicine_master_repository import MedicineMasterRepository
from app.modules.prescriptions.infrastructure.models.medicine_master_model import MedicineMasterModel
from app.modules.prescriptions.infrastructure.repositories.mappers import medicine_master_to_entity


class SqlAlchemyMedicineMasterRepository(MedicineMasterRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, medicine_id: UUID) -> MedicineMaster | None:
        result = await self._session.execute(
            select(MedicineMasterModel).where(
                MedicineMasterModel.id == medicine_id,
                MedicineMasterModel.is_active.is_(True),
            )
        )
        model = result.scalar_one_or_none()
        return medicine_master_to_entity(model) if model else None

    async def search(self, query: str, limit: int) -> list[MedicineMaster]:
        pattern = f"%{query}%"
        result = await self._session.execute(
            select(MedicineMasterModel)
            .where(
                MedicineMasterModel.is_active.is_(True),
                or_(
                    MedicineMasterModel.name.ilike(pattern),
                    MedicineMasterModel.generic_name.ilike(pattern),
                    MedicineMasterModel.strength.ilike(pattern),
                ),
            )
            .order_by(MedicineMasterModel.name.asc())
            .limit(limit)
        )
        return [medicine_master_to_entity(model) for model in result.scalars().all()]
