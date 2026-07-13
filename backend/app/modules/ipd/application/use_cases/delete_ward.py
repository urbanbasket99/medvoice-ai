from uuid import UUID

from app.modules.ipd.domain.exceptions import WardNotFoundError
from app.modules.ipd.domain.repositories.ward_repository import WardRepository


class DeleteWardUseCase:
    def __init__(self, ward_repository: WardRepository) -> None:
        self._wards = ward_repository

    async def execute(self, ward_id: UUID) -> None:
        deleted = await self._wards.soft_delete(ward_id)
        if not deleted:
            raise WardNotFoundError("Ward not found.")
