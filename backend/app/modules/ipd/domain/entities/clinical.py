from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.ipd.domain.value_objects import ChargeType, NursingNoteType, OtScheduleStatus


@dataclass(slots=True)
class NursingNote:
    id: UUID
    admission_id: UUID
    note_type: NursingNoteType
    content: str
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime
    recorded_by: UUID | None = None
    deleted_at: datetime | None = None
    recorded_by_name: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


@dataclass(slots=True)
class OtSchedule:
    id: UUID
    admission_id: UUID
    surgery_name: str
    surgeon_id: UUID
    scheduled_at: datetime
    status: OtScheduleStatus
    created_at: datetime
    updated_at: datetime
    theatre: str | None = None
    notes: str | None = None
    deleted_at: datetime | None = None
    surgeon_name: str | None = None
    surgeon_code: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


@dataclass(slots=True)
class MlcCase:
    id: UUID
    admission_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    police_station: str | None = None
    fir_number: str | None = None
    injury_details: str | None = None
    incident_datetime: datetime | None = None


@dataclass(slots=True)
class AdmissionCharge:
    id: UUID
    admission_id: UUID
    charge_type: ChargeType
    description: str
    amount: Decimal
    charge_date: date
    created_at: datetime
    updated_at: datetime
    invoice_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class ConsultationAdmissionContext:
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    chief_complaint: str | None
    diagnosis: str | None
    notes: str | None
