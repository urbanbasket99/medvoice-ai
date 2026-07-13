from app.modules.billing.domain.entities.tpa import Tpa
from app.modules.billing.domain.repositories.tpa_repository import TpaRepository


class ListTpasUseCase:
    def __init__(self, tpa_repository: TpaRepository) -> None:
        self._tpas = tpa_repository

    async def execute(self, *, active_only: bool = False) -> list[Tpa]:
        return await self._tpas.list_all(active_only=active_only)
