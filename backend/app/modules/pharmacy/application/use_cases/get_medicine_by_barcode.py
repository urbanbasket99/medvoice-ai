from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository


class GetMedicineByBarcodeUseCase:
    def __init__(self, medicine_repository: PharmacyMedicineRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, barcode: str):
        medicine = await self._medicines.get_by_barcode(barcode.strip())
        if medicine is None:
            raise PharmacyMedicineNotFoundError(f"No medicine found for barcode '{barcode}'.")
        return medicine
