from dataclasses import dataclass
from datetime import date, datetime
from uuid import UUID

from app.modules.certificates.domain.value_objects import CertificateType


@dataclass(frozen=True, slots=True)
class CreateCertificateInput:
    patient_id: UUID
    doctor_id: UUID
    certificate_type: CertificateType
    issue_date: date
    consultation_id: UUID | None
    valid_from: date | None
    valid_to: date | None
    diagnosis: str | None
    remarks: str | None
    fitness_status: str | None
    rest_days: int | None
    issued_by: UUID | None


@dataclass(frozen=True, slots=True)
class UpdateCertificateInput:
    doctor_id: UUID
    certificate_type: CertificateType
    issue_date: date
    consultation_id: UUID | None
    valid_from: date | None
    valid_to: date | None
    diagnosis: str | None
    remarks: str | None
    fitness_status: str | None
    rest_days: int | None


@dataclass(frozen=True, slots=True)
class CertificatePrintOutput:
    certificate_id: UUID
    certificate_number: str
    certificate_type: str
    issue_date: date
    valid_from: date | None
    valid_to: date | None
    diagnosis: str | None
    remarks: str | None
    fitness_status: str | None
    rest_days: int | None
    patient_name: str | None
    patient_mrn: str | None
    doctor_name: str | None
    doctor_code: str | None
    created_at: datetime
