from uuid import UUID

from app.modules.certificates.domain.exceptions import CertificateNotFoundError
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)


class DeleteCertificateUseCase:
    def __init__(self, certificate_repository: MedicalCertificateRepository) -> None:
        self._certificates = certificate_repository

    async def execute(self, certificate_id: UUID) -> None:
        deleted = await self._certificates.soft_delete(certificate_id)
        if not deleted:
            raise CertificateNotFoundError("Medical certificate not found.")
