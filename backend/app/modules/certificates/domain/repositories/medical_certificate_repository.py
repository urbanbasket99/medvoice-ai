from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.value_objects import CertificateListCriteria, CertificatePage


class MedicalCertificateRepository(ABC):
    @abstractmethod
    async def get_by_id(self, certificate_id: UUID) -> MedicalCertificate | None: ...

    @abstractmethod
    async def create(self, certificate: MedicalCertificate) -> MedicalCertificate: ...

    @abstractmethod
    async def update(self, certificate: MedicalCertificate) -> MedicalCertificate: ...

    @abstractmethod
    async def soft_delete(self, certificate_id: UUID) -> bool: ...

    @abstractmethod
    async def list_certificates(self, criteria: CertificateListCriteria) -> CertificatePage: ...

    @abstractmethod
    async def patient_exists(self, patient_id: UUID) -> bool: ...

    @abstractmethod
    async def doctor_exists(self, doctor_id: UUID) -> bool: ...
