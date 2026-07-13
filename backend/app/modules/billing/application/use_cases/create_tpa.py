from datetime import UTC, datetime
from uuid import uuid4

from app.modules.billing.application.dto.billing_dto import CreateTpaInput
from app.modules.billing.domain.entities.tpa import Tpa
from app.modules.billing.domain.exceptions import TpaCodeAlreadyExistsError
from app.modules.billing.domain.repositories.tpa_repository import TpaRepository


class CreateTpaUseCase:
    def __init__(self, tpa_repository: TpaRepository) -> None:
        self._tpas = tpa_repository

    async def execute(self, data: CreateTpaInput) -> Tpa:
        code = data.code.strip().upper()
        if await self._tpas.get_by_code(code) is not None:
            raise TpaCodeAlreadyExistsError(f"A TPA with code {code} already exists.")

        now = datetime.now(UTC)
        tpa = Tpa(
            id=uuid4(),
            code=code,
            name=data.name.strip(),
            contact_person=data.contact_person.strip() if data.contact_person else None,
            phone=data.phone.strip() if data.phone else None,
            email=data.email.strip().lower() if data.email else None,
            address=data.address,
            is_active=data.is_active,
            created_at=now,
            updated_at=now,
        )
        return await self._tpas.create(tpa)
