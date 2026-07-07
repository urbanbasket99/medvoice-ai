from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.prescriptions.application.dto.prescription_dto import (
    CreatePrescriptionInput,
    PrescriptionItemInput,
    PrescriptionPdfExportOutput,
    PrescriptionPrintOutput,
    UpdatePrescriptionInput,
)
from app.modules.prescriptions.domain.entities.medicine_master import MedicineMaster
from app.modules.prescriptions.domain.entities.prescription import Prescription, PrescriptionItem
from app.modules.prescriptions.domain.value_objects import (
    DosageInstruction,
    Frequency,
    PrescriptionPage,
    Route,
)


class DosageInstructionSchema(BaseModel):
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    before_food: bool = False
    after_food: bool = False

    @classmethod
    def from_entity(cls, dosage: DosageInstruction | None) -> "DosageInstructionSchema | None":
        if dosage is None:
            return None
        return cls(
            morning=dosage.morning,
            afternoon=dosage.afternoon,
            night=dosage.night,
            before_food=dosage.before_food,
            after_food=dosage.after_food,
        )

    def to_entity(self) -> DosageInstruction:
        return DosageInstruction(
            morning=self.morning,
            afternoon=self.afternoon,
            night=self.night,
            before_food=self.before_food,
            after_food=self.after_food,
        )


class PrescriptionItemRequest(BaseModel):
    medicine_master_id: UUID | None = None
    medicine_name: str = Field(min_length=1, max_length=200)
    strength: str | None = Field(default=None, max_length=50)
    dosage: str | None = Field(default=None, max_length=100)
    frequency: Frequency
    route: Route
    duration: str | None = Field(default=None, max_length=50)
    quantity: str | None = Field(default=None, max_length=50)
    instructions: str | None = Field(default=None, max_length=2000)
    sort_order: int = 0
    dosage_instruction: DosageInstructionSchema | None = None

    def to_input(self) -> PrescriptionItemInput:
        return PrescriptionItemInput(
            medicine_master_id=self.medicine_master_id,
            medicine_name=self.medicine_name,
            strength=self.strength,
            dosage=self.dosage,
            frequency=self.frequency,
            route=self.route,
            duration=self.duration,
            quantity=self.quantity,
            instructions=self.instructions,
            sort_order=self.sort_order,
            dosage_instruction=self.dosage_instruction.to_entity() if self.dosage_instruction else None,
        )


class PrescriptionCreateRequest(BaseModel):
    consultation_id: UUID
    diagnosis: str | None = Field(default=None, max_length=4000)
    advice: str | None = Field(default=None, max_length=4000)
    items: list[PrescriptionItemRequest] = Field(default_factory=list)

    def to_input(self) -> CreatePrescriptionInput:
        return CreatePrescriptionInput(
            consultation_id=self.consultation_id,
            diagnosis=self.diagnosis,
            advice=self.advice,
            items=tuple(item.to_input() for item in self.items),
        )


class PrescriptionUpdateRequest(BaseModel):
    diagnosis: str | None = Field(default=None, max_length=4000)
    advice: str | None = Field(default=None, max_length=4000)
    items: list[PrescriptionItemRequest] = Field(default_factory=list)

    def to_input(self) -> UpdatePrescriptionInput:
        return UpdatePrescriptionInput(
            diagnosis=self.diagnosis,
            advice=self.advice,
            items=tuple(item.to_input() for item in self.items),
        )


class PrescriptionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    prescription_id: UUID
    medicine_master_id: UUID | None
    medicine_name: str
    strength: str | None
    dosage: str | None
    frequency: Frequency
    route: Route
    duration: str | None
    quantity: str | None
    instructions: str | None
    sort_order: int
    dosage_instruction: DosageInstructionSchema | None

    @classmethod
    def from_entity(cls, item: PrescriptionItem) -> "PrescriptionItemResponse":
        return cls(
            id=item.id,
            prescription_id=item.prescription_id,
            medicine_master_id=item.medicine_master_id,
            medicine_name=item.medicine_name,
            strength=item.strength,
            dosage=item.dosage,
            frequency=item.frequency,
            route=item.route,
            duration=item.duration.value if item.duration else None,
            quantity=item.quantity,
            instructions=item.instructions,
            sort_order=item.sort_order,
            dosage_instruction=DosageInstructionSchema.from_entity(item.dosage_instruction),
        )


class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    diagnosis: str | None
    advice: str | None
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    doctor_specialization: str | None = None
    consultation_visit_number: str | None = None
    items: list[PrescriptionItemResponse] = Field(default_factory=list)

    @classmethod
    def from_entity(cls, prescription: Prescription) -> "PrescriptionResponse":
        return cls(
            id=prescription.id,
            consultation_id=prescription.consultation_id,
            patient_id=prescription.patient_id,
            doctor_id=prescription.doctor_id,
            diagnosis=prescription.diagnosis,
            advice=prescription.advice,
            created_at=prescription.created_at,
            updated_at=prescription.updated_at,
            patient_name=prescription.patient_name,
            patient_mrn=prescription.patient_mrn,
            patient_uhid=prescription.patient_uhid,
            patient_gender=prescription.patient_gender,
            patient_date_of_birth=prescription.patient_date_of_birth,
            doctor_name=prescription.doctor_name,
            doctor_code=prescription.doctor_code,
            doctor_specialization=prescription.doctor_specialization,
            consultation_visit_number=prescription.consultation_visit_number,
            items=[PrescriptionItemResponse.from_entity(item) for item in prescription.items or []],
        )


class PrescriptionListResponse(BaseModel):
    items: list[PrescriptionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: PrescriptionPage) -> "PrescriptionListResponse":
        return cls(
            items=[PrescriptionResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class MedicineMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    generic_name: str | None
    strength: str | None
    form: str | None
    default_route: Route | None
    manufacturer: str | None
    is_active: bool
    created_at: datetime

    @classmethod
    def from_entity(cls, medicine: MedicineMaster) -> "MedicineMasterResponse":
        return cls(
            id=medicine.id,
            name=medicine.name,
            generic_name=medicine.generic_name,
            strength=medicine.strength,
            form=medicine.form,
            default_route=medicine.default_route,
            manufacturer=medicine.manufacturer,
            is_active=medicine.is_active,
            created_at=medicine.created_at,
        )


class MedicineSearchResponse(BaseModel):
    items: list[MedicineMasterResponse]

    @classmethod
    def from_entities(cls, medicines: list[MedicineMaster]) -> "MedicineSearchResponse":
        return cls(items=[MedicineMasterResponse.from_entity(medicine) for medicine in medicines])


class PrescriptionPrintItemResponse(BaseModel):
    medicine_name: str
    strength: str | None
    dosage: str | None
    frequency: str
    route: str
    duration: str | None
    quantity: str | None
    instructions: str | None
    dosage_summary: str | None


class PrescriptionPrintResponse(BaseModel):
    prescription_id: UUID
    consultation_id: UUID
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    diagnosis: str | None
    advice: str | None
    items: list[PrescriptionPrintItemResponse]
    created_at: datetime

    @classmethod
    def from_output(cls, output: PrescriptionPrintOutput) -> "PrescriptionPrintResponse":
        return cls(
            prescription_id=output.prescription_id,
            consultation_id=output.consultation_id,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            patient_uhid=output.patient_uhid,
            patient_gender=output.patient_gender,
            patient_date_of_birth=output.patient_date_of_birth,
            doctor_name=output.doctor_name,
            doctor_code=output.doctor_code,
            doctor_specialization=output.doctor_specialization,
            consultation_visit_number=output.consultation_visit_number,
            diagnosis=output.diagnosis,
            advice=output.advice,
            items=[
                PrescriptionPrintItemResponse(
                    medicine_name=item.medicine_name,
                    strength=item.strength,
                    dosage=item.dosage,
                    frequency=item.frequency,
                    route=item.route,
                    duration=item.duration,
                    quantity=item.quantity,
                    instructions=item.instructions,
                    dosage_summary=item.dosage_summary,
                )
                for item in output.items
            ],
            created_at=output.created_at,
        )


class PrescriptionPdfExportResponse(BaseModel):
    pdf_placeholder: bool
    message: str
    prescription_id: UUID

    @classmethod
    def from_output(cls, output: PrescriptionPdfExportOutput) -> "PrescriptionPdfExportResponse":
        return cls(
            pdf_placeholder=output.pdf_placeholder,
            message=output.message,
            prescription_id=output.prescription_id,
        )
