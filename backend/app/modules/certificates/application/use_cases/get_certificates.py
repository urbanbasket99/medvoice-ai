from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)
from app.modules.certificates.domain.value_objects import CertificateListCriteria, CertificatePage


class GetCertificatesUseCase:
    def __init__(self, certificate_repository: MedicalCertificateRepository) -> None:
        self._certificates = certificate_repository

    async def execute(self, criteria: CertificateListCriteria) -> CertificatePage:
        return await self._certificates.list_certificates(criteria)
