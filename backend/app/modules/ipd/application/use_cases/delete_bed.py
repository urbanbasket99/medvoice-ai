from uuid import UUID

from app.modules.ipd.domain.exceptions import BedNotFoundError
from app.modules.ipd.domain.repositories.bed_repository import BedRepository


class DeleteBedUseCase:
    def __init__(self, bed_repository: BedRepository) -> None:
        self._beds = bed_repository

    async def execute(self, bed_id: UUID) -> None:
        deleted = await self._beds.soft_delete(bed_id)
        if not deleted:
            raise BedNotFoundError("Bed not found.")
