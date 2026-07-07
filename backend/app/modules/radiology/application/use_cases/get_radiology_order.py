from uuid import UUID

from app.modules.radiology.domain.entities.radiology_order import RadiologyOrder
from app.modules.radiology.domain.exceptions import RadiologyOrderNotFoundError
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository


class GetRadiologyOrderUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, radiology_order_id: UUID) -> RadiologyOrder:
        radiology_order = await self._radiology_orders.get_by_id(radiology_order_id)
        if radiology_order is None:
            raise RadiologyOrderNotFoundError("Radiology order not found.")
        return radiology_order
