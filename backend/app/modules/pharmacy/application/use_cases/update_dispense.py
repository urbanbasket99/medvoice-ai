from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.pharmacy.application.dto.pharmacy_dto import DispenseItemInput, UpdateDispenseInput
from app.modules.pharmacy.domain.entities.dispense_record import DispenseItem, DispenseRecord
from app.modules.pharmacy.domain.exceptions import DispenseRecordNotFoundError
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.value_objects import DispenseStatus


def _build_items(dispense_id: UUID, items: tuple[DispenseItemInput, ...]) -> list[DispenseItem]:
    built: list[DispenseItem] = []
    for index, item in enumerate(items):
        built.append(
            DispenseItem(
                id=uuid4(),
                dispense_id=dispense_id,
                prescription_item_id=item.prescription_item_id,
                medicine_id=item.medicine_id,
                batch_id=item.batch_id,
                medicine_name=item.medicine_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    return built


class UpdateDispenseUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, dispense_id: UUID, data: UpdateDispenseInput) -> DispenseRecord:
        existing = await self._dispenses.get_by_id(dispense_id)
        if existing is None:
            raise DispenseRecordNotFoundError("Dispense record not found.")

        if existing.status in (DispenseStatus.DISPENSED, DispenseStatus.CANCELLED):
            raise DispenseRecordNotFoundError("Cannot update a dispensed or cancelled record.")

        updated = DispenseRecord(
            id=existing.id,
            prescription_id=existing.prescription_id,
            consultation_id=existing.consultation_id,
            patient_id=existing.patient_id,
            doctor_id=existing.doctor_id,
            order_number=existing.order_number,
            status=existing.status,
            created_at=existing.created_at,
            updated_at=datetime.now(UTC),
            dispensed_by=existing.dispensed_by,
            notes=data.notes if data.notes is not None else existing.notes,
            dispensed_at=existing.dispensed_at,
            deleted_at=existing.deleted_at,
            items=_build_items(dispense_id, data.items) if data.items else existing.items,
            status_history=existing.status_history,
        )
        return await self._dispenses.update(updated)
