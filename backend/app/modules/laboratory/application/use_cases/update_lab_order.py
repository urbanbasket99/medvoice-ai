from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.laboratory.application.dto.lab_order_dto import LabOrderItemInput, UpdateLabOrderInput
from app.modules.laboratory.domain.entities.lab_order import LabOrder, LabOrderItem
from app.modules.laboratory.domain.exceptions import LabOrderNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository


def _build_items(lab_order_id: UUID, items: tuple[LabOrderItemInput, ...]) -> list[LabOrderItem]:
    built: list[LabOrderItem] = []
    for index, item in enumerate(items):
        built.append(
            LabOrderItem(
                id=uuid4(),
                lab_order_id=lab_order_id,
                lab_test_master_id=item.lab_test_master_id,
                lab_test_name=item.lab_test_name,
                category=item.category,
                sample_type=item.sample_type,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    return built


class UpdateLabOrderUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, lab_order_id: UUID, data: UpdateLabOrderInput) -> LabOrder:
        existing = await self._lab_orders.get_by_id(lab_order_id)
        if existing is None:
            raise LabOrderNotFoundError("Lab order not found.")

        existing.priority = data.priority
        existing.clinical_notes = data.clinical_notes
        existing.updated_at = datetime.now(UTC)
        existing.items = _build_items(lab_order_id, data.items)
        return await self._lab_orders.update(existing)
