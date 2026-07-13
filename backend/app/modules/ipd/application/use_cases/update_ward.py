from datetime import UTC, datetime
from uuid import UUID

from app.modules.ipd.application.dto.ipd_dto import UpdateWardInput
from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.exceptions import WardCodeExistsError, WardNotFoundError
from app.modules.ipd.domain.repositories.ward_repository import WardRepository


class UpdateWardUseCase:
    def __init__(self, ward_repository: WardRepository) -> None:
        self._wards = ward_repository

    async def execute(self, ward_id: UUID, data: UpdateWardInput) -> Ward:
        ward = await self._wards.get_by_id(ward_id)
        if ward is None:
            raise WardNotFoundError("Ward not found.")

        code = data.code.strip()
        existing = await self._wards.get_by_code(code)
        if existing is not None and existing.id != ward_id:
            raise WardCodeExistsError("A ward with this code already exists.")

        ward.code = code
        ward.name = data.name.strip()
        ward.ward_type = data.ward_type
        ward.floor = data.floor.strip() if data.floor else None
        ward.is_active = data.is_active
        ward.updated_at = datetime.now(UTC)
        return await self._wards.update(ward)
