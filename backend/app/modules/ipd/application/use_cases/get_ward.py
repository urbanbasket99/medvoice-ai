from uuid import UUID

from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.exceptions import WardNotFoundError
from app.modules.ipd.domain.repositories.ward_repository import WardRepository


class GetWardUseCase:
    def __init__(self, ward_repository: WardRepository) -> None:
        self._wards = ward_repository

    async def execute(self, ward_id: UUID) -> Ward:
        ward = await self._wards.get_by_id(ward_id)
        if ward is None:
            raise WardNotFoundError("Ward not found.")
        return ward
