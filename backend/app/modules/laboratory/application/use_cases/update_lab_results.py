from datetime import UTC, datetime
from uuid import UUID

from app.modules.laboratory.application.dto.lab_order_dto import UpdateLabResultsInput
from app.modules.laboratory.domain.entities.lab_order import LabOrder
from app.modules.laboratory.domain.exceptions import LabOrderNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository


class UpdateLabResultsUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(
        self,
        lab_order_id: UUID,
        data: UpdateLabResultsInput,
        resulted_by: UUID | None = None,
    ) -> LabOrder:
        existing = await self._lab_orders.get_by_id(lab_order_id)
        if existing is None:
            raise LabOrderNotFoundError("Lab order not found.")

        items_by_id = {item.id: item for item in existing.items or []}
        now = datetime.now(UTC)

        for result in data.items:
            item = items_by_id.get(result.id)
            if item is None:
                raise LabOrderNotFoundError(f"Lab order item {result.id} was not found.")
            item.result_value = result.result_value
            item.result_unit = result.result_unit
            item.reference_range = result.reference_range
            item.result_flag = result.result_flag
            item.result_notes = result.result_notes
            item.sample_barcode = result.sample_barcode
            item.resulted_at = now
            item.resulted_by = resulted_by

        existing.is_partial_report = data.is_partial_report
        existing.updated_at = now
        return await self._lab_orders.update(existing)
