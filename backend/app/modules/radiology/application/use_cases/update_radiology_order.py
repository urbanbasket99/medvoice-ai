from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.radiology.application.dto.radiology_order_dto import (
    RadiologyOrderItemInput,
    UpdateRadiologyOrderInput,
)
from app.modules.radiology.domain.entities.radiology_order import RadiologyOrder, RadiologyOrderItem
from app.modules.radiology.domain.exceptions import RadiologyOrderNotFoundError
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository


def _build_items(
    radiology_order_id: UUID, items: tuple[RadiologyOrderItemInput, ...]
) -> list[RadiologyOrderItem]:
    built: list[RadiologyOrderItem] = []
    for index, item in enumerate(items):
        built.append(
            RadiologyOrderItem(
                id=uuid4(),
                radiology_order_id=radiology_order_id,
                radiology_test_master_id=item.radiology_test_master_id,
                test_name=item.test_name,
                category=item.category,
                body_part=item.body_part,
                contrast_required=item.contrast_required,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    return built


class UpdateRadiologyOrderUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, radiology_order_id: UUID, data: UpdateRadiologyOrderInput) -> RadiologyOrder:
        existing = await self._radiology_orders.get_by_id(radiology_order_id)
        if existing is None:
            raise RadiologyOrderNotFoundError("Radiology order not found.")

        existing.priority = data.priority
        existing.clinical_notes = data.clinical_notes
        existing.updated_at = datetime.now(UTC)
        existing.items = _build_items(radiology_order_id, data.items)
        return await self._radiology_orders.update(existing)
