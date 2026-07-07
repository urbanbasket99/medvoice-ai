from app.modules.laboratory.domain.repositories.lab_test_master_repository import LabTestMasterRepository


class SearchLabTestsUseCase:
    def __init__(self, lab_test_repository: LabTestMasterRepository) -> None:
        self._lab_tests = lab_test_repository

    async def execute(self, query: str, limit: int) -> list:
        return await self._lab_tests.search(query, limit)
