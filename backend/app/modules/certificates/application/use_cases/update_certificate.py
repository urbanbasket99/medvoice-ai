from datetime import UTC, datetime
from uuid import UUID

from app.modules.certificates.application.dto.certificate_dto import UpdateCertificateInput
from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.exceptions import (
    CertificateDoctorNotFoundError,
    CertificateNotFoundError,
)
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)


class UpdateCertificateUseCase:
    def __init__(self, certificate_repository: MedicalCertificateRepository) -> None:
        self._certificates = certificate_repository

    async def execute(
        self, certificate_id: UUID, data: UpdateCertificateInput
    ) -> MedicalCertificate:
        existing = await self._certificates.get_by_id(certificate_id)
        if existing is None:
            raise CertificateNotFoundError("Medical certificate not found.")

        if not await self._certificates.doctor_exists(data.doctor_id):
            raise CertificateDoctorNotFoundError("The selected doctor does not exist.")

        existing.doctor_id = data.doctor_id
        existing.consultation_id = data.consultation_id
        existing.certificate_type = data.certificate_type
        existing.issue_date = data.issue_date
        existing.valid_from = data.valid_from
        existing.valid_to = data.valid_to
        existing.diagnosis = data.diagnosis
        existing.remarks = data.remarks
        existing.fitness_status = data.fitness_status
        existing.rest_days = data.rest_days
        existing.updated_at = datetime.now(UTC)
        return await self._certificates.update(existing)
