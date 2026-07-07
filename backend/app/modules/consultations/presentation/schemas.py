from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.consultations.domain.entities.consultation import (
    Consultation,
    ConsultationStatus,
    VitalSigns,
)
from app.modules.consultations.domain.value_objects import ConsultationPage


class VitalSignsSchema(BaseModel):
    blood_pressure_systolic: int | None = Field(default=None, ge=40, le=300)
    blood_pressure_diastolic: int | None = Field(default=None, ge=20, le=200)
    pulse: int | None = Field(default=None, ge=20, le=250)
    temperature: float | None = Field(default=None, ge=30, le=45)
    spo2: int | None = Field(default=None, ge=50, le=100)
    respiratory_rate: int | None = Field(default=None, ge=5, le=60)
    weight_kg: float | None = Field(default=None, ge=0, le=500)
    height_cm: float | None = Field(default=None, ge=0, le=300)

    @classmethod
    def from_entity(cls, vital_signs: VitalSigns | None) -> "VitalSignsSchema | None":
        if vital_signs is None:
            return None
        return cls(
            blood_pressure_systolic=vital_signs.blood_pressure_systolic,
            blood_pressure_diastolic=vital_signs.blood_pressure_diastolic,
            pulse=vital_signs.pulse,
            temperature=vital_signs.temperature,
            spo2=vital_signs.spo2,
            respiratory_rate=vital_signs.respiratory_rate,
            weight_kg=vital_signs.weight_kg,
            height_cm=vital_signs.height_cm,
        )

    def to_entity(self) -> VitalSigns:
        return VitalSigns(
            blood_pressure_systolic=self.blood_pressure_systolic,
            blood_pressure_diastolic=self.blood_pressure_diastolic,
            pulse=self.pulse,
            temperature=self.temperature,
            spo2=self.spo2,
            respiratory_rate=self.respiratory_rate,
            weight_kg=self.weight_kg,
            height_cm=self.height_cm,
        )


class ConsultationCreateRequest(BaseModel):
    appointment_id: UUID


class ConsultationUpdateRequest(BaseModel):
    chief_complaint: str | None = Field(default=None, max_length=4000)
    history_of_present_illness: str | None = Field(default=None, max_length=8000)
    past_medical_history: str | None = Field(default=None, max_length=8000)
    family_history: str | None = Field(default=None, max_length=4000)
    allergies: str | None = Field(default=None, max_length=4000)
    current_medications: str | None = Field(default=None, max_length=4000)
    vital_signs: VitalSignsSchema | None = None
    physical_examination: str | None = Field(default=None, max_length=8000)
    diagnosis: str | None = Field(default=None, max_length=4000)
    assessment: str | None = Field(default=None, max_length=8000)
    treatment_plan: str | None = Field(default=None, max_length=8000)
    doctor_notes: str | None = Field(default=None, max_length=8000)
    follow_up_date: date | None = None
    status: ConsultationStatus = ConsultationStatus.IN_PROGRESS


class ConsultationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    visit_number: str
    appointment_id: UUID
    patient_id: UUID
    doctor_id: UUID
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    appointment_number: str | None = None
    appointment_date: date | None = None
    appointment_time: time | None = None
    chief_complaint: str | None
    history_of_present_illness: str | None
    past_medical_history: str | None
    family_history: str | None
    allergies: str | None
    current_medications: str | None
    vital_signs: VitalSignsSchema | None
    physical_examination: str | None
    diagnosis: str | None
    assessment: str | None
    treatment_plan: str | None
    doctor_notes: str | None
    follow_up_date: date | None
    status: ConsultationStatus
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, consultation: Consultation) -> "ConsultationResponse":
        return cls(
            id=consultation.id,
            visit_number=consultation.visit_number,
            appointment_id=consultation.appointment_id,
            patient_id=consultation.patient_id,
            doctor_id=consultation.doctor_id,
            patient_name=consultation.patient_name,
            patient_mrn=consultation.patient_mrn,
            patient_uhid=consultation.patient_uhid,
            patient_gender=consultation.patient_gender,
            patient_date_of_birth=consultation.patient_date_of_birth,
            doctor_name=consultation.doctor_name,
            doctor_code=consultation.doctor_code,
            appointment_number=consultation.appointment_number,
            appointment_date=consultation.appointment_date,
            appointment_time=consultation.appointment_time,
            chief_complaint=consultation.chief_complaint,
            history_of_present_illness=consultation.history_of_present_illness,
            past_medical_history=consultation.past_medical_history,
            family_history=consultation.family_history,
            allergies=consultation.allergies,
            current_medications=consultation.current_medications,
            vital_signs=VitalSignsSchema.from_entity(consultation.vital_signs),
            physical_examination=consultation.physical_examination,
            diagnosis=consultation.diagnosis,
            assessment=consultation.assessment,
            treatment_plan=consultation.treatment_plan,
            doctor_notes=consultation.doctor_notes,
            follow_up_date=consultation.follow_up_date,
            status=consultation.status,
            created_at=consultation.created_at,
            updated_at=consultation.updated_at,
        )


class ConsultationListResponse(BaseModel):
    items: list[ConsultationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: ConsultationPage) -> "ConsultationListResponse":
        return cls(
            items=[ConsultationResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )
