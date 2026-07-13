from app.modules.ipd.domain.repositories.bed_repository import BedRepository
from app.modules.ipd.domain.value_objects import BedListCriteria, BedPage


class GetBedsUseCase:
    def __init__(self, bed_repository: BedRepository) -> None:
        self._beds = bed_repository

    async def execute(self, criteria: BedListCriteria) -> BedPage:
        return await self._beds.list_beds(criteria)
