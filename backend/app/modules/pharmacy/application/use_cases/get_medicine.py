from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository


class GetMedicineUseCase:
    def __init__(self, medicine_repository: PharmacyMedicineRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, medicine_id: UUID) -> PharmacyMedicine:
        medicine = await self._medicines.get_by_id(medicine_id)
        if medicine is None:
            raise PharmacyMedicineNotFoundError("Pharmacy medicine not found.")
        return medicine
