from uuid import UUID

from app.modules.certificates.application.dto.certificate_dto import CertificatePrintOutput
from app.modules.certificates.domain.exceptions import CertificateNotFoundError
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)


class GetCertificatePrintUseCase:
    def __init__(self, certificate_repository: MedicalCertificateRepository) -> None:
        self._certificates = certificate_repository

    async def execute(self, certificate_id: UUID) -> CertificatePrintOutput:
        certificate = await self._certificates.get_by_id(certificate_id)
        if certificate is None:
            raise CertificateNotFoundError("Medical certificate not found.")

        return CertificatePrintOutput(
            certificate_id=certificate.id,
            certificate_number=certificate.certificate_number,
            certificate_type=certificate.certificate_type.value,
            issue_date=certificate.issue_date,
            valid_from=certificate.valid_from,
            valid_to=certificate.valid_to,
            diagnosis=certificate.diagnosis,
            remarks=certificate.remarks,
            fitness_status=certificate.fitness_status,
            rest_days=certificate.rest_days,
            patient_name=certificate.patient_name,
            patient_mrn=certificate.patient_mrn,
            doctor_name=certificate.doctor_name,
            doctor_code=certificate.doctor_code,
            created_at=certificate.created_at,
        )
