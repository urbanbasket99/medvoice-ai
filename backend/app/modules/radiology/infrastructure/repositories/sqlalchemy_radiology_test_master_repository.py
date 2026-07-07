from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.radiology.domain.entities.radiology_test_master import RadiologyTestMaster
from app.modules.radiology.domain.repositories.radiology_test_master_repository import (
    RadiologyTestMasterRepository,
)
from app.modules.radiology.infrastructure.models.radiology_order_model import RadiologyTestMasterModel
from app.modules.radiology.infrastructure.repositories.mappers import radiology_test_master_to_entity


class SqlAlchemyRadiologyTestMasterRepository(RadiologyTestMasterRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def search(self, query: str, limit: int) -> list[RadiologyTestMaster]:
        pattern = f"%{query}%"
        result = await self._session.execute(
            select(RadiologyTestMasterModel)
            .where(
                RadiologyTestMasterModel.is_active.is_(True),
                or_(
                    RadiologyTestMasterModel.test_name.ilike(pattern),
                    RadiologyTestMasterModel.test_code.ilike(pattern),
                    RadiologyTestMasterModel.category.ilike(pattern),
                    RadiologyTestMasterModel.body_part.ilike(pattern),
                ),
            )
            .order_by(RadiologyTestMasterModel.test_name.asc())
            .limit(limit)
        )
        return [radiology_test_master_to_entity(model) for model in result.scalars().all()]

    async def list_active(self, page: int, page_size: int) -> tuple[list[RadiologyTestMaster], int]:
        conditions = [RadiologyTestMasterModel.is_active.is_(True)]
        total = (
            await self._session.execute(
                select(func.count()).select_from(RadiologyTestMasterModel).where(*conditions)
            )
        ).scalar_one()
        offset = (page - 1) * page_size
        result = await self._session.execute(
            select(RadiologyTestMasterModel)
            .where(*conditions)
            .order_by(RadiologyTestMasterModel.category.asc(), RadiologyTestMasterModel.test_name.asc())
            .offset(offset)
            .limit(page_size)
        )
        items = [radiology_test_master_to_entity(model) for model in result.scalars().all()]
        return items, total
