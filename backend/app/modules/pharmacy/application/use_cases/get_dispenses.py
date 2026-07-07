from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.value_objects import DispenseListCriteria, DispensePage


class GetDispensesUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, criteria: DispenseListCriteria) -> DispensePage:
        return await self._dispenses.list_dispenses(criteria)
