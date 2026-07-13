from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.certificates.domain.value_objects import CertificateType


@dataclass(slots=True)
class MedicalCertificate:
    id: UUID
    certificate_number: str
    patient_id: UUID
    doctor_id: UUID
    certificate_type: CertificateType
    issue_date: date
    created_at: datetime
    updated_at: datetime
    consultation_id: UUID | None = None
    valid_from: date | None = None
    valid_to: date | None = None
    diagnosis: str | None = None
    remarks: str | None = None
    fitness_status: str | None = None
    rest_days: int | None = None
    issued_by: UUID | None = None
    deleted_at: datetime | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
