from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.doctors.application.dto.availability_dto import ReplaceAvailabilityInput
from app.modules.doctors.domain.entities.doctor_availability_slot import DoctorAvailabilitySlot
from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.doctors.domain.repositories.doctor_availability_repository import (
    DoctorAvailabilityRepository,
)
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository


class ReplaceDoctorAvailabilityUseCase:
    def __init__(
        self,
        doctor_repository: DoctorRepository,
        availability_repository: DoctorAvailabilityRepository,
    ) -> None:
        self._doctors = doctor_repository
        self._availability = availability_repository

    async def execute(
        self, doctor_id: UUID, data: ReplaceAvailabilityInput
    ) -> list[DoctorAvailabilitySlot]:
        if await self._doctors.get_by_id(doctor_id) is None:
            raise DoctorNotFoundError("Doctor not found.")

        now = datetime.now(UTC)
        slots = [
            DoctorAvailabilitySlot(
                id=uuid4(),
                doctor_id=doctor_id,
                day_of_week=slot.day_of_week,
                start_time=slot.start_time,
                end_time=slot.end_time,
                slot_minutes=slot.slot_minutes,
                is_active=slot.is_active,
                created_at=now,
                updated_at=now,
            )
            for slot in data.slots
        ]
        return await self._availability.replace_all(doctor_id, slots)
