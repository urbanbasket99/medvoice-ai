from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import UpdateDispenseStatusInput
from app.modules.pharmacy.application.use_cases.create_dispense import _apply_dispense_stock
from app.modules.pharmacy.domain.entities.dispense_record import DispenseRecord
from app.modules.pharmacy.domain.exceptions import (
    DispenseInvalidStatusTransitionError,
    DispenseRecordNotFoundError,
)
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import DispenseStatus

_VALID_TRANSITIONS: dict[DispenseStatus, set[DispenseStatus]] = {
    DispenseStatus.PENDING: {DispenseStatus.IN_PROGRESS, DispenseStatus.DISPENSED, DispenseStatus.CANCELLED},
    DispenseStatus.IN_PROGRESS: {DispenseStatus.DISPENSED, DispenseStatus.CANCELLED},
    DispenseStatus.DISPENSED: set(),
    DispenseStatus.CANCELLED: set(),
}


class UpdateDispenseStatusUseCase:
    def __init__(
        self,
        dispense_repository: DispenseRecordRepository,
        stock_repository: PharmacyStockRepository,
    ) -> None:
        self._dispenses = dispense_repository
        self._stock = stock_repository

    async def execute(self, dispense_id: UUID, data: UpdateDispenseStatusInput) -> DispenseRecord:
        existing = await self._dispenses.get_by_id(dispense_id)
        if existing is None:
            raise DispenseRecordNotFoundError("Dispense record not found.")

        try:
            new_status = DispenseStatus(data.status)
        except ValueError as exc:
            raise DispenseInvalidStatusTransitionError("Invalid dispense status.") from exc

        allowed = _VALID_TRANSITIONS.get(existing.status, set())
        if new_status != existing.status and new_status not in allowed:
            raise DispenseInvalidStatusTransitionError(
                f"Cannot transition from '{existing.status.value}' to '{new_status.value}'."
            )

        updated = await self._dispenses.update_status(
            dispense_id,
            new_status,
            data.notes,
            data.dispensed_by if new_status == DispenseStatus.DISPENSED else None,
        )

        if new_status == DispenseStatus.DISPENSED and existing.status != DispenseStatus.DISPENSED:
            items = updated.items or []
            await _apply_dispense_stock(
                self._stock, items, dispense_id, data.dispensed_by
            )

        return updated
