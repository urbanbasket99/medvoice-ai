from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.value_objects import AdmissionPage, AdmissionListCriteria


class AdmissionRepository(ABC):
    @abstractmethod
    async def get_by_id(self, admission_id: UUID) -> Admission | None: ...

    @abstractmethod
    async def create(self, admission: Admission) -> Admission: ...

    @abstractmethod
    async def update(self, admission: Admission) -> Admission: ...

    @abstractmethod
    async def list_admissions(self, criteria: AdmissionListCriteria) -> AdmissionPage: ...

    @abstractmethod
    async def patient_exists(self, patient_id: UUID) -> bool: ...

    @abstractmethod
    async def doctor_exists(self, doctor_id: UUID) -> bool: ...

    @abstractmethod
    async def consultation_matches_patient(
        self, consultation_id: UUID, patient_id: UUID
    ) -> bool: ...

    @abstractmethod
    async def has_active_admission(self, patient_id: UUID) -> bool: ...
