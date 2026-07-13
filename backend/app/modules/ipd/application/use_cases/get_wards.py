from app.modules.ipd.domain.repositories.ward_repository import WardRepository
from app.modules.ipd.domain.value_objects import WardListCriteria, WardPage


class GetWardsUseCase:
    def __init__(self, ward_repository: WardRepository) -> None:
        self._wards = ward_repository

    async def execute(self, criteria: WardListCriteria) -> WardPage:
        return await self._wards.list_wards(criteria)
