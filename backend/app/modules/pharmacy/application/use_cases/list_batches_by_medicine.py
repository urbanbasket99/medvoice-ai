from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_batch import PharmacyBatch
from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_batch_repository import PharmacyBatchRepository
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository


class ListBatchesByMedicineUseCase:
    def __init__(
        self,
        batch_repository: PharmacyBatchRepository,
        medicine_repository: PharmacyMedicineRepository,
    ) -> None:
        self._batches = batch_repository
        self._medicines = medicine_repository

    async def execute(self, medicine_id: UUID) -> list[PharmacyBatch]:
        medicine = await self._medicines.get_by_id(medicine_id)
        if medicine is None:
            raise PharmacyMedicineNotFoundError("Pharmacy medicine not found.")
        return await self._batches.list_by_medicine(medicine_id)
