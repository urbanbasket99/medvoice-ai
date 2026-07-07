from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.value_objects import MedicineListCriteria, MedicinePage


class GetMedicinesUseCase:
    def __init__(self, medicine_repository: PharmacyMedicineRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, criteria: MedicineListCriteria) -> MedicinePage:
        return await self._medicines.list_medicines(criteria)
