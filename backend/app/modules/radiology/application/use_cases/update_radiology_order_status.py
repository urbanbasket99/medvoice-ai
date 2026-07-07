from uuid import UUID

from app.modules.radiology.application.dto.radiology_order_dto import UpdateRadiologyOrderStatusInput
from app.modules.radiology.domain.entities.radiology_order import RadiologyOrder
from app.modules.radiology.domain.exceptions import (
    RadiologyOrderInvalidStatusTransitionError,
    RadiologyOrderNotFoundError,
)
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.radiology.domain.value_objects import RadiologyStatus

_VALID_TRANSITIONS: dict[RadiologyStatus, set[RadiologyStatus]] = {
    RadiologyStatus.ORDERED: {RadiologyStatus.SCHEDULED, RadiologyStatus.CANCELLED},
    RadiologyStatus.SCHEDULED: {RadiologyStatus.IN_PROGRESS, RadiologyStatus.CANCELLED},
    RadiologyStatus.IN_PROGRESS: {RadiologyStatus.COMPLETED, RadiologyStatus.CANCELLED},
    RadiologyStatus.COMPLETED: set(),
    RadiologyStatus.CANCELLED: set(),
}


class UpdateRadiologyOrderStatusUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, radiology_order_id: UUID, data: UpdateRadiologyOrderStatusInput) -> RadiologyOrder:
        existing = await self._radiology_orders.get_by_id(radiology_order_id)
        if existing is None:
            raise RadiologyOrderNotFoundError("Radiology order not found.")

        try:
            new_status = RadiologyStatus(data.status)
        except ValueError as exc:
            raise RadiologyOrderInvalidStatusTransitionError("Invalid radiology order status.") from exc

        allowed = _VALID_TRANSITIONS.get(existing.status, set())
        if new_status != existing.status and new_status not in allowed:
            raise RadiologyOrderInvalidStatusTransitionError(
                f"Cannot transition from '{existing.status.value}' to '{new_status.value}'."
            )

        return await self._radiology_orders.update_status(radiology_order_id, new_status, data.notes)
