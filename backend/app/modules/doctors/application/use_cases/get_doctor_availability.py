from uuid import UUID

from app.modules.doctors.domain.entities.doctor_availability_slot import DoctorAvailabilitySlot
from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.doctors.domain.repositories.doctor_availability_repository import (
    DoctorAvailabilityRepository,
)
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository


class GetDoctorAvailabilityUseCase:
    def __init__(
        self,
        doctor_repository: DoctorRepository,
        availability_repository: DoctorAvailabilityRepository,
    ) -> None:
        self._doctors = doctor_repository
        self._availability = availability_repository

    async def execute(self, doctor_id: UUID) -> list[DoctorAvailabilitySlot]:
        if await self._doctors.get_by_id(doctor_id) is None:
            raise DoctorNotFoundError("Doctor not found.")
        return await self._availability.list_by_doctor(doctor_id)
