from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository


class GetLowStockUseCase:
    def __init__(self, stock_repository: PharmacyStockRepository) -> None:
        self._stock = stock_repository

    async def execute(self) -> list[PharmacyMedicineStock]:
        return await self._stock.get_low_stock()
