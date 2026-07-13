from uuid import UUID

from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.exceptions import BedNotFoundError
from app.modules.ipd.domain.repositories.bed_repository import BedRepository


class GetBedUseCase:
    def __init__(self, bed_repository: BedRepository) -> None:
        self._beds = bed_repository

    async def execute(self, bed_id: UUID) -> Bed:
        bed = await self._beds.get_by_id(bed_id)
        if bed is None:
            raise BedNotFoundError("Bed not found.")
        return bed
