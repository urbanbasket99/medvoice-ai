from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.laboratory.domain.entities.lab_test_master import LabTestMaster
from app.modules.laboratory.domain.repositories.lab_test_master_repository import LabTestMasterRepository
from app.modules.laboratory.infrastructure.models.lab_order_model import LabTestMasterModel
from app.modules.laboratory.infrastructure.repositories.mappers import lab_test_master_to_entity


class SqlAlchemyLabTestMasterRepository(LabTestMasterRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def search(self, query: str, limit: int) -> list[LabTestMaster]:
        pattern = f"%{query}%"
        result = await self._session.execute(
            select(LabTestMasterModel)
            .where(
                LabTestMasterModel.is_active.is_(True),
                or_(
                    LabTestMasterModel.test_name.ilike(pattern),
                    LabTestMasterModel.test_code.ilike(pattern),
                    LabTestMasterModel.department.ilike(pattern),
                ),
            )
            .order_by(LabTestMasterModel.test_name.asc())
            .limit(limit)
        )
        return [lab_test_master_to_entity(model) for model in result.scalars().all()]

    async def list_active(self, page: int, page_size: int) -> tuple[list[LabTestMaster], int]:
        conditions = [LabTestMasterModel.is_active.is_(True)]
        total = (
            await self._session.execute(
                select(func.count()).select_from(LabTestMasterModel).where(*conditions)
            )
        ).scalar_one()
        offset = (page - 1) * page_size
        result = await self._session.execute(
            select(LabTestMasterModel)
            .where(*conditions)
            .order_by(LabTestMasterModel.department.asc(), LabTestMasterModel.test_name.asc())
            .offset(offset)
            .limit(page_size)
        )
        items = [lab_test_master_to_entity(model) for model in result.scalars().all()]
        return items, total
