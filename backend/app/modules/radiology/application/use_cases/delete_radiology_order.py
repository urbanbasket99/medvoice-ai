from uuid import UUID

from app.modules.radiology.domain.exceptions import RadiologyOrderNotFoundError
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository


class DeleteRadiologyOrderUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, radiology_order_id: UUID) -> None:
        deleted = await self._radiology_orders.soft_delete(radiology_order_id)
        if not deleted:
            raise RadiologyOrderNotFoundError("Radiology order not found.")
