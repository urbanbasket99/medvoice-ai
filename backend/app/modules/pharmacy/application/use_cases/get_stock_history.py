from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import StockMovementListCriteria, StockMovementPage


class GetStockHistoryUseCase:
    def __init__(self, stock_repository: PharmacyStockRepository) -> None:
        self._stock = stock_repository

    async def execute(self, criteria: StockMovementListCriteria) -> StockMovementPage:
        return await self._stock.get_movement_history(criteria)
