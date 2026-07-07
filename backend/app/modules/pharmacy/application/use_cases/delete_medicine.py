from uuid import UUID

from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository


class DeleteMedicineUseCase:
    def __init__(self, medicine_repository: PharmacyMedicineRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, medicine_id: UUID) -> None:
        deleted = await self._medicines.soft_delete(medicine_id)
        if not deleted:
            raise PharmacyMedicineNotFoundError("Pharmacy medicine not found.")
