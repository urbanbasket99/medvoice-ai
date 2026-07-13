from datetime import UTC, datetime
from uuid import UUID

from app.modules.ipd.application.dto.ipd_dto import UpdateBedInput
from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.exceptions import BedNotFoundError, WardNotFoundError
from app.modules.ipd.domain.repositories.bed_repository import BedRepository


class UpdateBedUseCase:
    def __init__(self, bed_repository: BedRepository) -> None:
        self._beds = bed_repository

    async def execute(self, bed_id: UUID, data: UpdateBedInput) -> Bed:
        bed = await self._beds.get_by_id(bed_id)
        if bed is None:
            raise BedNotFoundError("Bed not found.")

        if not await self._beds.ward_exists(data.ward_id):
            raise WardNotFoundError("Ward not found.")

        bed.ward_id = data.ward_id
        bed.bed_number = data.bed_number.strip()
        bed.status = data.status
        bed.updated_at = datetime.now(UTC)
        return await self._beds.update(bed)
