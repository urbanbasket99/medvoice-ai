from app.modules.patients.domain.repositories.patient_repository import PatientRepository
from app.modules.patients.domain.value_objects import PatientPage


class SearchPatientsUseCase:
    """Free-text search across UHID, name, mobile, and email — backs `GET /patients/search`."""

    def __init__(self, patient_repository: PatientRepository) -> None:
        self._patients = patient_repository

    async def execute(self, query: str, page: int = 1, page_size: int = 20) -> PatientPage:
        normalized = query.strip()
        if not normalized:
            return PatientPage(items=[], total=0, page=page, page_size=page_size)
        return await self._patients.search_patients(normalized, page, page_size)
