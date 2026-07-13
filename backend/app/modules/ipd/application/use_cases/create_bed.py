from datetime import UTC, datetime
from uuid import uuid4

from app.modules.ipd.application.dto.ipd_dto import CreateBedInput
from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.exceptions import WardNotFoundError
from app.modules.ipd.domain.repositories.bed_repository import BedRepository


class CreateBedUseCase:
    def __init__(self, bed_repository: BedRepository) -> None:
        self._beds = bed_repository

    async def execute(self, data: CreateBedInput) -> Bed:
        if not await self._beds.ward_exists(data.ward_id):
            raise WardNotFoundError("Ward not found.")

        now = datetime.now(UTC)
        bed = Bed(
            id=uuid4(),
            ward_id=data.ward_id,
            bed_number=data.bed_number.strip(),
            status=data.status,
            created_at=now,
            updated_at=now,
        )
        return await self._beds.create(bed)
