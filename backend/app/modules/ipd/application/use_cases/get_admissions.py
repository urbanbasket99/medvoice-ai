from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.value_objects import AdmissionListCriteria, AdmissionPage


class GetAdmissionsUseCase:
    def __init__(self, admission_repository: AdmissionRepository) -> None:
        self._admissions = admission_repository

    async def execute(self, criteria: AdmissionListCriteria) -> AdmissionPage:
        return await self._admissions.list_admissions(criteria)
