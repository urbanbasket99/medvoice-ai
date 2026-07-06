from app.modules.patients.domain.repositories.patient_repository import PatientRepository
from app.modules.patients.domain.value_objects import PatientListCriteria, PatientPage


class GetPatientsUseCase:
    """Paginated, sorted, filtered listing — backs `GET /patients`."""

    def __init__(self, patient_repository: PatientRepository) -> None:
        self._patients = patient_repository

    async def execute(self, criteria: PatientListCriteria) -> PatientPage:
        return await self._patients.list_patients(criteria)
