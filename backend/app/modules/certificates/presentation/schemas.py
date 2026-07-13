from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.certificates.application.dto.certificate_dto import (
    CertificatePrintOutput,
    CreateCertificateInput,
    UpdateCertificateInput,
)
from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.value_objects import CertificatePage, CertificateType


class CertificateCreateRequest(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    certificate_type: CertificateType
    issue_date: date
    consultation_id: UUID | None = None
    valid_from: date | None = None
    valid_to: date | None = None
    diagnosis: str | None = None
    remarks: str | None = None
    fitness_status: str | None = Field(default=None, max_length=40)
    rest_days: int | None = Field(default=None, ge=0)
    issued_by: UUID | None = None

    def to_input(self) -> CreateCertificateInput:
        return CreateCertificateInput(
            patient_id=self.patient_id,
            doctor_id=self.doctor_id,
            certificate_type=self.certificate_type,
            issue_date=self.issue_date,
            consultation_id=self.consultation_id,
            valid_from=self.valid_from,
            valid_to=self.valid_to,
            diagnosis=self.diagnosis,
            remarks=self.remarks,
            fitness_status=self.fitness_status,
            rest_days=self.rest_days,
            issued_by=self.issued_by,
        )


class CertificateUpdateRequest(BaseModel):
    doctor_id: UUID
    certificate_type: CertificateType
    issue_date: date
    consultation_id: UUID | None = None
    valid_from: date | None = None
    valid_to: date | None = None
    diagnosis: str | None = None
    remarks: str | None = None
    fitness_status: str | None = Field(default=None, max_length=40)
    rest_days: int | None = Field(default=None, ge=0)

    def to_input(self) -> UpdateCertificateInput:
        return UpdateCertificateInput(
            doctor_id=self.doctor_id,
            certificate_type=self.certificate_type,
            issue_date=self.issue_date,
            consultation_id=self.consultation_id,
            valid_from=self.valid_from,
            valid_to=self.valid_to,
            diagnosis=self.diagnosis,
            remarks=self.remarks,
            fitness_status=self.fitness_status,
            rest_days=self.rest_days,
        )


class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    certificate_number: str
    patient_id: UUID
    doctor_id: UUID
    consultation_id: UUID | None
    certificate_type: CertificateType
    issue_date: date
    valid_from: date | None
    valid_to: date | None
    diagnosis: str | None
    remarks: str | None
    fitness_status: str | None
    rest_days: int | None
    issued_by: UUID | None
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    patient_mrn: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None

    @classmethod
    def from_entity(cls, certificate: MedicalCertificate) -> "CertificateResponse":
        return cls(
            id=certificate.id,
            certificate_number=certificate.certificate_number,
            patient_id=certificate.patient_id,
            doctor_id=certificate.doctor_id,
            consultation_id=certificate.consultation_id,
            certificate_type=certificate.certificate_type,
            issue_date=certificate.issue_date,
            valid_from=certificate.valid_from,
            valid_to=certificate.valid_to,
            diagnosis=certificate.diagnosis,
            remarks=certificate.remarks,
            fitness_status=certificate.fitness_status,
            rest_days=certificate.rest_days,
            issued_by=certificate.issued_by,
            created_at=certificate.created_at,
            updated_at=certificate.updated_at,
            patient_name=certificate.patient_name,
            patient_mrn=certificate.patient_mrn,
            doctor_name=certificate.doctor_name,
            doctor_code=certificate.doctor_code,
        )


class CertificateListResponse(BaseModel):
    items: list[CertificateResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: CertificatePage) -> "CertificateListResponse":
        return cls(
            items=[CertificateResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class CertificatePrintResponse(BaseModel):
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

    @classmethod
    def from_output(cls, output: CertificatePrintOutput) -> "CertificatePrintResponse":
        return cls(
            certificate_id=output.certificate_id,
            certificate_number=output.certificate_number,
            certificate_type=output.certificate_type,
            issue_date=output.issue_date,
            valid_from=output.valid_from,
            valid_to=output.valid_to,
            diagnosis=output.diagnosis,
            remarks=output.remarks,
            fitness_status=output.fitness_status,
            rest_days=output.rest_days,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            doctor_name=output.doctor_name,
            doctor_code=output.doctor_code,
            created_at=output.created_at,
        )
