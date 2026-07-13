from datetime import UTC, datetime
from uuid import uuid4

from app.modules.ipd.application.dto.ipd_dto import CreateWardInput
from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.exceptions import WardCodeExistsError
from app.modules.ipd.domain.repositories.ward_repository import WardRepository


class CreateWardUseCase:
    def __init__(self, ward_repository: WardRepository) -> None:
        self._wards = ward_repository

    async def execute(self, data: CreateWardInput) -> Ward:
        existing = await self._wards.get_by_code(data.code.strip())
        if existing is not None:
            raise WardCodeExistsError("A ward with this code already exists.")

        now = datetime.now(UTC)
        ward = Ward(
            id=uuid4(),
            code=data.code.strip(),
            name=data.name.strip(),
            ward_type=data.ward_type,
            floor=data.floor.strip() if data.floor else None,
            is_active=data.is_active,
            created_at=now,
            updated_at=now,
        )
        return await self._wards.create(ward)
