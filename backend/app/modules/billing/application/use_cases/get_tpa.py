from uuid import UUID

from app.modules.billing.domain.entities.tpa import Tpa
from app.modules.billing.domain.exceptions import TpaNotFoundError
from app.modules.billing.domain.repositories.tpa_repository import TpaRepository


class GetTpaUseCase:
    def __init__(self, tpa_repository: TpaRepository) -> None:
        self._tpas = tpa_repository

    async def execute(self, tpa_id: UUID) -> Tpa:
        tpa = await self._tpas.get_by_id(tpa_id)
        if tpa is None:
            raise TpaNotFoundError("TPA not found.")
        return tpa
