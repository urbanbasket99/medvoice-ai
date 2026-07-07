from uuid import UUID

from app.modules.laboratory.domain.exceptions import LabOrderNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository


class DeleteLabOrderUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, lab_order_id: UUID) -> None:
        deleted = await self._lab_orders.soft_delete(lab_order_id)
        if not deleted:
            raise LabOrderNotFoundError("Lab order not found.")
