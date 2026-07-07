from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.value_objects import DispensePage


class SearchDispensesUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, query: str, page: int, page_size: int) -> DispensePage:
        return await self._dispenses.search_dispenses(query, page, page_size)
