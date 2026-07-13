from uuid import UUID

from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.exceptions import CertificateNotFoundError
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)


class GetCertificateUseCase:
    def __init__(self, certificate_repository: MedicalCertificateRepository) -> None:
        self._certificates = certificate_repository

    async def execute(self, certificate_id: UUID) -> MedicalCertificate:
        certificate = await self._certificates.get_by_id(certificate_id)
        if certificate is None:
            raise CertificateNotFoundError("Medical certificate not found.")
        return certificate
