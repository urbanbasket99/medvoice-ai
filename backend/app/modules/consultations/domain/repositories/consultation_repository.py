from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from app.modules.consultations.domain.entities.consultation import Consultation
from app.modules.consultations.domain.value_objects import ConsultationListCriteria, ConsultationPage


class AppointmentSnapshot:
    """Minimal appointment data needed to start a consultation."""

    def __init__(
        self,
        *,
        id: UUID,
        patient_id: UUID,
        doctor_id: UUID,
        chief_complaint: str | None,
    ) -> None:
        self.id = id
        self.patient_id = patient_id
        self.doctor_id = doctor_id
        self.chief_complaint = chief_complaint


class ConsultationRepository(ABC):
    @abstractmethod
    async def get_by_id(self, consultation_id: UUID) -> Consultation | None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_appointment_id(self, appointment_id: UUID) -> Consultation | None:
        raise NotImplementedError

    @abstractmethod
    async def appointment_exists(self, appointment_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def get_appointment_snapshot(self, appointment_id: UUID) -> AppointmentSnapshot | None:
        raise NotImplementedError

    @abstractmethod
    async def patient_exists(self, patient_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def doctor_exists(self, doctor_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def get_patient_allergies(self, patient_id: UUID) -> str | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, consultation: Consultation) -> Consultation:
        raise NotImplementedError

    @abstractmethod
    async def update(self, consultation: Consultation) -> Consultation:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, consultation_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_consultations(self, criteria: ConsultationListCriteria) -> ConsultationPage:
        raise NotImplementedError

    @abstractmethod
    async def search_consultations(self, query: str, page: int, page_size: int) -> ConsultationPage:
        raise NotImplementedError

    @abstractmethod
    async def count_by_status_and_date(
        self, *, status: str | None = None, date_from: date | None = None, date_to: date | None = None
    ) -> int:
        raise NotImplementedError
