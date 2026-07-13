from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.modules.ipd.domain.value_objects import AdmissionStatus, AdmissionType


@dataclass(slots=True)
class Admission:
    id: UUID
    admission_number: str
    patient_id: UUID
    admitting_doctor_id: UUID
    admission_date: datetime
    admission_type: AdmissionType
    status: AdmissionStatus
    created_at: datetime
    updated_at: datetime
    consultation_id: UUID | None = None
    bed_id: UUID | None = None
    expected_discharge_date: datetime | None = None
    chief_complaint: str | None = None
    diagnosis: str | None = None
    notes: str | None = None
    discharged_at: datetime | None = None
    discharge_summary: str | None = None
    discharged_by: UUID | None = None
    deleted_at: datetime | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    consultation_visit_number: str | None = None
    bed_number: str | None = None
    ward_name: str | None = None
    discharged_by_name: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
