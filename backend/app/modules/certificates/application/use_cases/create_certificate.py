from datetime import UTC, datetime
from uuid import uuid4

from app.modules.certificates.application.dto.certificate_dto import CreateCertificateInput
from app.modules.certificates.application.interfaces.certificate_number_generator import (
    CertificateNumberGenerator,
)
from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.exceptions import (
    CertificateDoctorNotFoundError,
    CertificatePatientNotFoundError,
)
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)


class CreateCertificateUseCase:
    def __init__(
        self,
        certificate_repository: MedicalCertificateRepository,
        number_generator: CertificateNumberGenerator,
    ) -> None:
        self._certificates = certificate_repository
        self._numbers = number_generator

    async def execute(self, data: CreateCertificateInput) -> MedicalCertificate:
        if not await self._certificates.patient_exists(data.patient_id):
            raise CertificatePatientNotFoundError("The selected patient does not exist.")
        if not await self._certificates.doctor_exists(data.doctor_id):
            raise CertificateDoctorNotFoundError("The selected doctor does not exist.")

        now = datetime.now(UTC)
        certificate = MedicalCertificate(
            id=uuid4(),
            certificate_number=await self._numbers.generate(),
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            consultation_id=data.consultation_id,
            certificate_type=data.certificate_type,
            issue_date=data.issue_date,
            valid_from=data.valid_from,
            valid_to=data.valid_to,
            diagnosis=data.diagnosis,
            remarks=data.remarks,
            fitness_status=data.fitness_status,
            rest_days=data.rest_days,
            issued_by=data.issued_by,
            created_at=now,
            updated_at=now,
        )
        return await self._certificates.create(certificate)
