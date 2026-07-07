from uuid import UUID

from app.modules.pharmacy.domain.exceptions import DispenseRecordNotFoundError
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository


class DeleteDispenseUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, dispense_id: UUID) -> None:
        deleted = await self._dispenses.soft_delete(dispense_id)
        if not deleted:
            raise DispenseRecordNotFoundError("Dispense record not found.")
