from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.domain.value_objects import LabOrderListCriteria, LabOrderPage


class GetLabOrdersUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, criteria: LabOrderListCriteria) -> LabOrderPage:
        return await self._lab_orders.list_lab_orders(criteria)
