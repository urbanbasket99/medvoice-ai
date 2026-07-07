from app.modules.radiology.domain.repositories.radiology_test_master_repository import (
    RadiologyTestMasterRepository,
)


class GetRadiologyTestsUseCase:
    def __init__(self, radiology_test_repository: RadiologyTestMasterRepository) -> None:
        self._radiology_tests = radiology_test_repository

    async def execute(self, page: int, page_size: int) -> tuple[list, int]:
        return await self._radiology_tests.list_active(page, page_size)
