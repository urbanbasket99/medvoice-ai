from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.value_objects import MedicinePage


class SearchMedicinesUseCase:
    def __init__(self, medicine_repository: PharmacyMedicineRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, query: str, page: int, page_size: int) -> MedicinePage:
        return await self._medicines.search_medicines(query, page, page_size)
