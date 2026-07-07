from uuid import UUID

from app.modules.doctors.domain.entities.doctor import Doctor
from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository


class GetDoctorUseCase:
    def __init__(self, doctor_repository: DoctorRepository) -> None:
        self._doctors = doctor_repository

    async def execute(self, doctor_id: UUID) -> Doctor:
        doctor = await self._doctors.get_by_id(doctor_id)
        if doctor is None:
            raise DoctorNotFoundError(f"Doctor {doctor_id} was not found.")
        return doctor
