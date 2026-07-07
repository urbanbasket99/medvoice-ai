from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.radiology.domain.value_objects import RadiologyOrderListCriteria, RadiologyOrderPage


class GetRadiologyOrdersUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, criteria: RadiologyOrderListCriteria) -> RadiologyOrderPage:
        return await self._radiology_orders.list_radiology_orders(criteria)
