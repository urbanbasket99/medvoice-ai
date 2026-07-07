from app.modules.prescriptions.domain.entities.medicine_master import MedicineMaster
from app.modules.prescriptions.domain.repositories.medicine_master_repository import MedicineMasterRepository


class SearchMedicinesUseCase:
    def __init__(self, medicine_repository: MedicineMasterRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, query: str, limit: int = 20) -> list[MedicineMaster]:
        return await self._medicines.search(query, limit)
