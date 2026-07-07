from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository
from app.modules.doctors.domain.value_objects import DoctorListCriteria, DoctorPage


class GetDoctorsUseCase:
    """Paginated, sorted, filtered listing — backs `GET /doctors`."""

    def __init__(self, doctor_repository: DoctorRepository) -> None:
        self._doctors = doctor_repository

    async def execute(self, criteria: DoctorListCriteria) -> DoctorPage:
        return await self._doctors.list_doctors(criteria)
