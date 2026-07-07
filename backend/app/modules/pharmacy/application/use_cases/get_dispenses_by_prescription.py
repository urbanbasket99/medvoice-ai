from uuid import UUID

from app.modules.pharmacy.domain.entities.dispense_record import DispenseRecord
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository


class GetDispensesByPrescriptionUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, prescription_id: UUID) -> list[DispenseRecord]:
        return await self._dispenses.list_by_prescription(prescription_id)
