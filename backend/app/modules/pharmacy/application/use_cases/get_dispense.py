from uuid import UUID

from app.modules.pharmacy.domain.entities.dispense_record import DispenseRecord
from app.modules.pharmacy.domain.exceptions import DispenseRecordNotFoundError
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository


class GetDispenseUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, dispense_id: UUID) -> DispenseRecord:
        dispense = await self._dispenses.get_by_id(dispense_id)
        if dispense is None:
            raise DispenseRecordNotFoundError("Dispense record not found.")
        return dispense
