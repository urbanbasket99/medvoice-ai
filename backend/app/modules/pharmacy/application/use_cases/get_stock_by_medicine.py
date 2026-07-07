from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock
from app.modules.pharmacy.domain.exceptions import PharmacyStockNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository


class GetStockByMedicineUseCase:
    def __init__(self, stock_repository: PharmacyStockRepository) -> None:
        self._stock = stock_repository

    async def execute(self, medicine_id: UUID) -> PharmacyMedicineStock:
        stock = await self._stock.get_by_medicine_id(medicine_id)
        if stock is None:
            raise PharmacyStockNotFoundError("Stock record not found for this medicine.")
        return stock
