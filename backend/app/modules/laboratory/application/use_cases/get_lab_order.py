from uuid import UUID

from app.modules.laboratory.domain.entities.lab_order import LabOrder
from app.modules.laboratory.domain.exceptions import LabOrderNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository


class GetLabOrderUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, lab_order_id: UUID) -> LabOrder:
        lab_order = await self._lab_orders.get_by_id(lab_order_id)
        if lab_order is None:
            raise LabOrderNotFoundError("Lab order not found.")
        return lab_order
