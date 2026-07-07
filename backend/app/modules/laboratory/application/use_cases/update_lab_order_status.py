from uuid import UUID

from app.modules.laboratory.application.dto.lab_order_dto import UpdateLabOrderStatusInput
from app.modules.laboratory.domain.entities.lab_order import LabOrder
from app.modules.laboratory.domain.exceptions import (
    LabOrderInvalidStatusTransitionError,
    LabOrderNotFoundError,
)
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.domain.value_objects import LabStatus

_VALID_TRANSITIONS: dict[LabStatus, set[LabStatus]] = {
    LabStatus.ORDERED: {LabStatus.SAMPLE_COLLECTED, LabStatus.CANCELLED},
    LabStatus.SAMPLE_COLLECTED: {LabStatus.IN_PROGRESS, LabStatus.CANCELLED},
    LabStatus.IN_PROGRESS: {LabStatus.COMPLETED, LabStatus.CANCELLED},
    LabStatus.COMPLETED: set(),
    LabStatus.CANCELLED: set(),
}


class UpdateLabOrderStatusUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, lab_order_id: UUID, data: UpdateLabOrderStatusInput) -> LabOrder:
        existing = await self._lab_orders.get_by_id(lab_order_id)
        if existing is None:
            raise LabOrderNotFoundError("Lab order not found.")

        try:
            new_status = LabStatus(data.status)
        except ValueError as exc:
            raise LabOrderInvalidStatusTransitionError("Invalid lab order status.") from exc

        allowed = _VALID_TRANSITIONS.get(existing.status, set())
        if new_status != existing.status and new_status not in allowed:
            raise LabOrderInvalidStatusTransitionError(
                f"Cannot transition from '{existing.status.value}' to '{new_status.value}'."
            )

        return await self._lab_orders.update_status(lab_order_id, new_status, data.notes)
