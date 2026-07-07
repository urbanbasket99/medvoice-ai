from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository
from app.modules.doctors.domain.value_objects import DoctorPage


class SearchDoctorsUseCase:
    """Free-text search across doctor code, name, registration number, mobile, and email.

    Backs `GET /doctors/search`.
    """

    def __init__(self, doctor_repository: DoctorRepository) -> None:
        self._doctors = doctor_repository

    async def execute(self, query: str, page: int = 1, page_size: int = 20) -> DoctorPage:
        normalized = query.strip()
        if not normalized:
            return DoctorPage(items=[], total=0, page=page, page_size=page_size)
        return await self._doctors.search_doctors(normalized, page, page_size)
