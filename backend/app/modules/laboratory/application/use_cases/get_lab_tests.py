from app.modules.laboratory.domain.repositories.lab_test_master_repository import LabTestMasterRepository


class GetLabTestsUseCase:
    def __init__(self, lab_test_repository: LabTestMasterRepository) -> None:
        self._lab_tests = lab_test_repository

    async def execute(self, page: int, page_size: int) -> tuple[list, int]:
        return await self._lab_tests.list_active(page, page_size)
