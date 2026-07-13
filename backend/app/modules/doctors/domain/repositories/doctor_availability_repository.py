from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.doctors.domain.entities.doctor_availability_slot import DoctorAvailabilitySlot


class DoctorAvailabilityRepository(ABC):
    @abstractmethod
    async def list_by_doctor(self, doctor_id: UUID) -> list[DoctorAvailabilitySlot]: ...

    @abstractmethod
    async def replace_all(
        self, doctor_id: UUID, slots: list[DoctorAvailabilitySlot]
    ) -> list[DoctorAvailabilitySlot]: ...
