from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from app.modules.appointments.domain.entities.appointment import Appointment
from app.modules.appointments.domain.value_objects import AppointmentListCriteria, AppointmentPage


class AppointmentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, appointment_id: UUID) -> Appointment | None: ...

    @abstractmethod
    async def get_by_number(self, appointment_number: str) -> Appointment | None: ...

    @abstractmethod
    async def patient_exists(self, patient_id: UUID) -> bool: ...

    @abstractmethod
    async def doctor_exists(self, doctor_id: UUID) -> bool: ...

    @abstractmethod
    async def get_doctor_department(self, doctor_id: UUID) -> str | None: ...

    @abstractmethod
    async def next_token_number(self, doctor_id: UUID, appointment_date: date) -> int: ...

    @abstractmethod
    async def has_overlapping_slot(
        self,
        doctor_id: UUID,
        appointment_date: date,
        appointment_time,
        duration_minutes: int,
        exclude_id: UUID | None = None,
    ) -> bool: ...

    @abstractmethod
    async def create(self, appointment: Appointment) -> Appointment: ...

    @abstractmethod
    async def update(self, appointment: Appointment) -> Appointment: ...

    @abstractmethod
    async def soft_delete(self, appointment_id: UUID) -> bool: ...

    @abstractmethod
    async def list_appointments(self, criteria: AppointmentListCriteria) -> AppointmentPage: ...

    @abstractmethod
    async def search_appointments(self, query: str, page: int, page_size: int) -> AppointmentPage: ...
