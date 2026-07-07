from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.radiology.domain.value_objects import RadiologyOrderPage


class SearchRadiologyOrdersUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, query: str, page: int, page_size: int) -> RadiologyOrderPage:
        return await self._radiology_orders.search_radiology_orders(query, page, page_size)
