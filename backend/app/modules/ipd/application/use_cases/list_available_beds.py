from uuid import UUID

from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.repositories.bed_repository import BedRepository


class ListAvailableBedsUseCase:
    def __init__(self, bed_repository: BedRepository) -> None:
        self._beds = bed_repository

    async def execute(self, ward_id: UUID | None = None) -> list[Bed]:
        return await self._beds.list_available(ward_id)
