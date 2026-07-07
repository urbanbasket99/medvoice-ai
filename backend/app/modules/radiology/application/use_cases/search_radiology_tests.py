from app.modules.radiology.domain.repositories.radiology_test_master_repository import (
    RadiologyTestMasterRepository,
)


class SearchRadiologyTestsUseCase:
    def __init__(self, radiology_test_repository: RadiologyTestMasterRepository) -> None:
        self._radiology_tests = radiology_test_repository

    async def execute(self, query: str, limit: int) -> list:
        return await self._radiology_tests.search(query, limit)
