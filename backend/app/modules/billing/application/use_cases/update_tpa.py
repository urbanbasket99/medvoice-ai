from datetime import UTC, datetime
from uuid import UUID

from app.modules.billing.application.dto.billing_dto import UpdateTpaInput
from app.modules.billing.domain.entities.tpa import Tpa
from app.modules.billing.domain.exceptions import TpaCodeAlreadyExistsError, TpaNotFoundError
from app.modules.billing.domain.repositories.tpa_repository import TpaRepository


class UpdateTpaUseCase:
    def __init__(self, tpa_repository: TpaRepository) -> None:
        self._tpas = tpa_repository

    async def execute(self, tpa_id: UUID, data: UpdateTpaInput) -> Tpa:
        existing = await self._tpas.get_by_id(tpa_id)
        if existing is None:
            raise TpaNotFoundError("TPA not found.")

        code = data.code.strip().upper()
        conflict = await self._tpas.get_by_code(code)
        if conflict is not None and conflict.id != tpa_id:
            raise TpaCodeAlreadyExistsError(f"A TPA with code {code} already exists.")

        existing.code = code
        existing.name = data.name.strip()
        existing.contact_person = data.contact_person.strip() if data.contact_person else None
        existing.phone = data.phone.strip() if data.phone else None
        existing.email = data.email.strip().lower() if data.email else None
        existing.address = data.address
        existing.is_active = data.is_active
        existing.updated_at = datetime.now(UTC)
        return await self._tpas.update(existing)
