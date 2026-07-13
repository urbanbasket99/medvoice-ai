from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.ipd.domain.value_objects import AdmissionType, BedStatus, WardType, NursingNoteType, OtScheduleStatus, ChargeType

@dataclass(frozen=True, slots=True)
class CreateWardInput:
    code: str
    name: str
    ward_type: WardType
    floor: str | None
    is_active: bool


@dataclass(frozen=True, slots=True)
class UpdateWardInput:
    code: str
    name: str
    ward_type: WardType
    floor: str | None
    is_active: bool


@dataclass(frozen=True, slots=True)
class CreateBedInput:
    ward_id: UUID
    bed_number: str
    status: BedStatus


@dataclass(frozen=True, slots=True)
class UpdateBedInput:
    ward_id: UUID
    bed_number: str
    status: BedStatus


@dataclass(frozen=True, slots=True)
class CreateAdmissionInput:
    patient_id: UUID
    admitting_doctor_id: UUID
    admission_date: datetime
    admission_type: AdmissionType
    consultation_id: UUID | None
    bed_id: UUID | None
    expected_discharge_date: datetime | None
    chief_complaint: str | None
    diagnosis: str | None
    notes: str | None


@dataclass(frozen=True, slots=True)
class UpdateAdmissionInput:
    admitting_doctor_id: UUID
    admission_date: datetime
    admission_type: AdmissionType
    consultation_id: UUID | None
    bed_id: UUID | None
    expected_discharge_date: datetime | None
    chief_complaint: str | None
    diagnosis: str | None
    notes: str | None


@dataclass(frozen=True, slots=True)
class DischargeAdmissionInput:
    discharge_summary: str | None
    discharged_by: UUID | None


@dataclass(frozen=True, slots=True)
class CreateAdmissionFromConsultationInput:
    consultation_id: UUID
    bed_id: UUID | None
    admission_date: datetime
    expected_discharge_date: datetime | None
    notes: str | None


@dataclass(frozen=True, slots=True)
class CreateNursingNoteInput:
    admission_id: UUID
    note_type: NursingNoteType
    content: str
    recorded_at: datetime
    recorded_by: UUID | None


@dataclass(frozen=True, slots=True)
class CreateOtScheduleInput:
    admission_id: UUID
    surgery_name: str
    surgeon_id: UUID
    theatre: str | None
    scheduled_at: datetime
    status: OtScheduleStatus
    notes: str | None


@dataclass(frozen=True, slots=True)
class UpdateOtScheduleInput:
    surgery_name: str
    surgeon_id: UUID
    theatre: str | None
    scheduled_at: datetime
    status: OtScheduleStatus
    notes: str | None


@dataclass(frozen=True, slots=True)
class UpsertMlcCaseInput:
    admission_id: UUID
    police_station: str | None
    fir_number: str | None
    injury_details: str | None
    incident_datetime: datetime | None
    is_active: bool


@dataclass(frozen=True, slots=True)
class CreateAdmissionChargeInput:
    admission_id: UUID
    charge_type: ChargeType
    description: str
    amount: Decimal
    charge_date: date


@dataclass(frozen=True, slots=True)
class GenerateAdmissionInvoiceInput:
    admission_id: UUID
    invoice_date: date
    notes: str | None
