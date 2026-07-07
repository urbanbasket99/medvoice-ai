from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.domain.value_objects import LabOrderPage


class SearchLabOrdersUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, query: str, page: int, page_size: int) -> LabOrderPage:
        return await self._lab_orders.search_lab_orders(query, page, page_size)
