from uuid import UUID

from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import InventoryListCriteria, InventoryPage


class GetInventoryUseCase:
    def __init__(self, stock_repository: PharmacyStockRepository) -> None:
        self._stock = stock_repository

    async def execute(self, criteria: InventoryListCriteria) -> InventoryPage:
        return await self._stock.get_inventory(criteria)
