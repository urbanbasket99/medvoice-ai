from uuid import UUID

from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository


class GetAdmissionUseCase:
    def __init__(self, admission_repository: AdmissionRepository) -> None:
        self._admissions = admission_repository

    async def execute(self, admission_id: UUID) -> Admission:
        admission = await self._admissions.get_by_id(admission_id)
        if admission is None:
            raise AdmissionNotFoundError("Admission not found.")
        return admission
