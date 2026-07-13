from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.billing.presentation.schemas import InvoiceResponse
from app.modules.ipd.application.dto.ipd_dto import (
    CreateAdmissionChargeInput,
    CreateAdmissionFromConsultationInput,
    CreateNursingNoteInput,
    CreateOtScheduleInput,
    GenerateAdmissionInvoiceInput,
    UpdateOtScheduleInput,
    UpsertMlcCaseInput,
)
from app.modules.ipd.domain.entities.clinical import (
    AdmissionCharge,
    MlcCase,
    NursingNote,
    OtSchedule,
)
from app.modules.ipd.domain.value_objects import ChargeType, NursingNoteType, OtScheduleStatus


class AdmissionFromConsultationRequest(BaseModel):
    consultation_id: UUID
    bed_id: UUID | None = None
    admission_date: datetime
    expected_discharge_date: datetime | None = None
    notes: str | None = None

    def to_input(self) -> CreateAdmissionFromConsultationInput:
        return CreateAdmissionFromConsultationInput(
            consultation_id=self.consultation_id,
            bed_id=self.bed_id,
            admission_date=self.admission_date,
            expected_discharge_date=self.expected_discharge_date,
            notes=self.notes,
        )


class NursingNoteCreateRequest(BaseModel):
    note_type: NursingNoteType
    content: str = Field(min_length=1)
    recorded_at: datetime

    def to_input(self, admission_id: UUID, recorded_by: UUID | None) -> CreateNursingNoteInput:
        return CreateNursingNoteInput(
            admission_id=admission_id,
            note_type=self.note_type,
            content=self.content,
            recorded_at=self.recorded_at,
            recorded_by=recorded_by,
        )


class NursingNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    admission_id: UUID
    note_type: NursingNoteType
    content: str
    recorded_at: datetime
    recorded_by: UUID | None
    recorded_by_name: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, note: NursingNote) -> "NursingNoteResponse":
        return cls(
            id=note.id,
            admission_id=note.admission_id,
            note_type=note.note_type,
            content=note.content,
            recorded_at=note.recorded_at,
            recorded_by=note.recorded_by,
            recorded_by_name=note.recorded_by_name,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )


class NursingNoteListResponse(BaseModel):
    items: list[NursingNoteResponse]

    @classmethod
    def from_entities(cls, notes: list[NursingNote]) -> "NursingNoteListResponse":
        return cls(items=[NursingNoteResponse.from_entity(note) for note in notes])


class OtScheduleCreateRequest(BaseModel):
    surgery_name: str = Field(min_length=1, max_length=200)
    surgeon_id: UUID
    theatre: str | None = Field(default=None, max_length=100)
    scheduled_at: datetime
    status: OtScheduleStatus = OtScheduleStatus.SCHEDULED
    notes: str | None = None

    def to_input(self, admission_id: UUID) -> CreateOtScheduleInput:
        return CreateOtScheduleInput(
            admission_id=admission_id,
            surgery_name=self.surgery_name,
            surgeon_id=self.surgeon_id,
            theatre=self.theatre,
            scheduled_at=self.scheduled_at,
            status=self.status,
            notes=self.notes,
        )


class OtScheduleUpdateRequest(BaseModel):
    surgery_name: str = Field(min_length=1, max_length=200)
    surgeon_id: UUID
    theatre: str | None = Field(default=None, max_length=100)
    scheduled_at: datetime
    status: OtScheduleStatus
    notes: str | None = None

    def to_input(self) -> UpdateOtScheduleInput:
        return UpdateOtScheduleInput(
            surgery_name=self.surgery_name,
            surgeon_id=self.surgeon_id,
            theatre=self.theatre,
            scheduled_at=self.scheduled_at,
            status=self.status,
            notes=self.notes,
        )


class OtScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    admission_id: UUID
    surgery_name: str
    surgeon_id: UUID
    surgeon_name: str | None
    surgeon_code: str | None
    theatre: str | None
    scheduled_at: datetime
    status: OtScheduleStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, schedule: OtSchedule) -> "OtScheduleResponse":
        return cls(
            id=schedule.id,
            admission_id=schedule.admission_id,
            surgery_name=schedule.surgery_name,
            surgeon_id=schedule.surgeon_id,
            surgeon_name=schedule.surgeon_name,
            surgeon_code=schedule.surgeon_code,
            theatre=schedule.theatre,
            scheduled_at=schedule.scheduled_at,
            status=schedule.status,
            notes=schedule.notes,
            created_at=schedule.created_at,
            updated_at=schedule.updated_at,
        )


class OtScheduleListResponse(BaseModel):
    items: list[OtScheduleResponse]

    @classmethod
    def from_entities(cls, schedules: list[OtSchedule]) -> "OtScheduleListResponse":
        return cls(items=[OtScheduleResponse.from_entity(item) for item in schedules])


class MlcCaseUpsertRequest(BaseModel):
    police_station: str | None = Field(default=None, max_length=200)
    fir_number: str | None = Field(default=None, max_length=100)
    injury_details: str | None = None
    incident_datetime: datetime | None = None
    is_active: bool = True

    def to_input(self, admission_id: UUID) -> UpsertMlcCaseInput:
        return UpsertMlcCaseInput(
            admission_id=admission_id,
            police_station=self.police_station,
            fir_number=self.fir_number,
            injury_details=self.injury_details,
            incident_datetime=self.incident_datetime,
            is_active=self.is_active,
        )


class MlcCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    admission_id: UUID
    police_station: str | None
    fir_number: str | None
    injury_details: str | None
    incident_datetime: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, mlc_case: MlcCase) -> "MlcCaseResponse":
        return cls(
            id=mlc_case.id,
            admission_id=mlc_case.admission_id,
            police_station=mlc_case.police_station,
            fir_number=mlc_case.fir_number,
            injury_details=mlc_case.injury_details,
            incident_datetime=mlc_case.incident_datetime,
            is_active=mlc_case.is_active,
            created_at=mlc_case.created_at,
            updated_at=mlc_case.updated_at,
        )


class AdmissionChargeCreateRequest(BaseModel):
    charge_type: ChargeType
    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0)
    charge_date: date

    def to_input(self, admission_id: UUID) -> CreateAdmissionChargeInput:
        return CreateAdmissionChargeInput(
            admission_id=admission_id,
            charge_type=self.charge_type,
            description=self.description,
            amount=self.amount,
            charge_date=self.charge_date,
        )


class AdmissionChargeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    admission_id: UUID
    charge_type: ChargeType
    description: str
    amount: Decimal
    charge_date: date
    invoice_id: UUID | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, charge: AdmissionCharge) -> "AdmissionChargeResponse":
        return cls(
            id=charge.id,
            admission_id=charge.admission_id,
            charge_type=charge.charge_type,
            description=charge.description,
            amount=charge.amount,
            charge_date=charge.charge_date,
            invoice_id=charge.invoice_id,
            created_at=charge.created_at,
            updated_at=charge.updated_at,
        )


class AdmissionChargeListResponse(BaseModel):
    items: list[AdmissionChargeResponse]

    @classmethod
    def from_entities(cls, charges: list[AdmissionCharge]) -> "AdmissionChargeListResponse":
        return cls(items=[AdmissionChargeResponse.from_entity(item) for item in charges])


class GenerateAdmissionInvoiceRequest(BaseModel):
    invoice_date: date
    notes: str | None = None

    def to_input(self, admission_id: UUID) -> GenerateAdmissionInvoiceInput:
        return GenerateAdmissionInvoiceInput(
            admission_id=admission_id,
            invoice_date=self.invoice_date,
            notes=self.notes,
        )


class GenerateAdmissionInvoiceResponse(BaseModel):
    invoice: InvoiceResponse

    @classmethod
    def from_invoice(cls, invoice) -> "GenerateAdmissionInvoiceResponse":
        return cls(invoice=InvoiceResponse.from_entity(invoice))
