from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.ipd.application.dto.ipd_dto import (
    CreateAdmissionInput,
    CreateBedInput,
    CreateWardInput,
    DischargeAdmissionInput,
    UpdateAdmissionInput,
    UpdateBedInput,
    UpdateWardInput,
)
from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.value_objects import (
    AdmissionPage,
    AdmissionStatus,
    AdmissionType,
    BedPage,
    BedStatus,
    WardPage,
    WardType,
)


class WardCreateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=200)
    ward_type: WardType
    floor: str | None = Field(default=None, max_length=50)
    is_active: bool = True

    def to_input(self) -> CreateWardInput:
        return CreateWardInput(
            code=self.code,
            name=self.name,
            ward_type=self.ward_type,
            floor=self.floor,
            is_active=self.is_active,
        )


class WardUpdateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=200)
    ward_type: WardType
    floor: str | None = Field(default=None, max_length=50)
    is_active: bool = True

    def to_input(self) -> UpdateWardInput:
        return UpdateWardInput(
            code=self.code,
            name=self.name,
            ward_type=self.ward_type,
            floor=self.floor,
            is_active=self.is_active,
        )


class WardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    ward_type: WardType
    floor: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, ward: Ward) -> "WardResponse":
        return cls(
            id=ward.id,
            code=ward.code,
            name=ward.name,
            ward_type=ward.ward_type,
            floor=ward.floor,
            is_active=ward.is_active,
            created_at=ward.created_at,
            updated_at=ward.updated_at,
        )


class WardListResponse(BaseModel):
    items: list[WardResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: WardPage) -> "WardListResponse":
        return cls(
            items=[WardResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class BedCreateRequest(BaseModel):
    ward_id: UUID
    bed_number: str = Field(min_length=1, max_length=30)
    status: BedStatus = BedStatus.AVAILABLE

    def to_input(self) -> CreateBedInput:
        return CreateBedInput(
            ward_id=self.ward_id,
            bed_number=self.bed_number,
            status=self.status,
        )


class BedUpdateRequest(BaseModel):
    ward_id: UUID
    bed_number: str = Field(min_length=1, max_length=30)
    status: BedStatus

    def to_input(self) -> UpdateBedInput:
        return UpdateBedInput(
            ward_id=self.ward_id,
            bed_number=self.bed_number,
            status=self.status,
        )


class BedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ward_id: UUID
    bed_number: str
    status: BedStatus
    created_at: datetime
    updated_at: datetime
    ward_code: str | None = None
    ward_name: str | None = None
    ward_type: str | None = None
    ward_floor: str | None = None

    @classmethod
    def from_entity(cls, bed: Bed) -> "BedResponse":
        return cls(
            id=bed.id,
            ward_id=bed.ward_id,
            bed_number=bed.bed_number,
            status=bed.status,
            created_at=bed.created_at,
            updated_at=bed.updated_at,
            ward_code=bed.ward_code,
            ward_name=bed.ward_name,
            ward_type=bed.ward_type,
            ward_floor=bed.ward_floor,
        )


class BedListResponse(BaseModel):
    items: list[BedResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: BedPage) -> "BedListResponse":
        return cls(
            items=[BedResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class AdmissionCreateRequest(BaseModel):
    patient_id: UUID
    admitting_doctor_id: UUID
    admission_date: datetime
    admission_type: AdmissionType
    consultation_id: UUID | None = None
    bed_id: UUID | None = None
    expected_discharge_date: datetime | None = None
    chief_complaint: str | None = None
    diagnosis: str | None = None
    notes: str | None = None

    def to_input(self) -> CreateAdmissionInput:
        return CreateAdmissionInput(
            patient_id=self.patient_id,
            admitting_doctor_id=self.admitting_doctor_id,
            admission_date=self.admission_date,
            admission_type=self.admission_type,
            consultation_id=self.consultation_id,
            bed_id=self.bed_id,
            expected_discharge_date=self.expected_discharge_date,
            chief_complaint=self.chief_complaint,
            diagnosis=self.diagnosis,
            notes=self.notes,
        )


class AdmissionUpdateRequest(BaseModel):
    admitting_doctor_id: UUID
    admission_date: datetime
    admission_type: AdmissionType
    consultation_id: UUID | None = None
    bed_id: UUID | None = None
    expected_discharge_date: datetime | None = None
    chief_complaint: str | None = None
    diagnosis: str | None = None
    notes: str | None = None

    def to_input(self) -> UpdateAdmissionInput:
        return UpdateAdmissionInput(
            admitting_doctor_id=self.admitting_doctor_id,
            admission_date=self.admission_date,
            admission_type=self.admission_type,
            consultation_id=self.consultation_id,
            bed_id=self.bed_id,
            expected_discharge_date=self.expected_discharge_date,
            chief_complaint=self.chief_complaint,
            diagnosis=self.diagnosis,
            notes=self.notes,
        )


class AdmissionDischargeRequest(BaseModel):
    discharge_summary: str | None = None
    discharged_by: UUID | None = None

    def to_input(self) -> DischargeAdmissionInput:
        return DischargeAdmissionInput(
            discharge_summary=self.discharge_summary,
            discharged_by=self.discharged_by,
        )


class AdmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    admission_number: str
    patient_id: UUID
    consultation_id: UUID | None
    admitting_doctor_id: UUID
    bed_id: UUID | None
    admission_date: datetime
    expected_discharge_date: datetime | None
    admission_type: AdmissionType
    status: AdmissionStatus
    chief_complaint: str | None
    diagnosis: str | None
    notes: str | None
    discharged_at: datetime | None
    discharge_summary: str | None
    discharged_by: UUID | None
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    patient_mrn: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    consultation_visit_number: str | None = None
    bed_number: str | None = None
    ward_name: str | None = None
    discharged_by_name: str | None = None

    @classmethod
    def from_entity(cls, admission: Admission) -> "AdmissionResponse":
        return cls(
            id=admission.id,
            admission_number=admission.admission_number,
            patient_id=admission.patient_id,
            consultation_id=admission.consultation_id,
            admitting_doctor_id=admission.admitting_doctor_id,
            bed_id=admission.bed_id,
            admission_date=admission.admission_date,
            expected_discharge_date=admission.expected_discharge_date,
            admission_type=admission.admission_type,
            status=admission.status,
            chief_complaint=admission.chief_complaint,
            diagnosis=admission.diagnosis,
            notes=admission.notes,
            discharged_at=admission.discharged_at,
            discharge_summary=admission.discharge_summary,
            discharged_by=admission.discharged_by,
            created_at=admission.created_at,
            updated_at=admission.updated_at,
            patient_name=admission.patient_name,
            patient_mrn=admission.patient_mrn,
            doctor_name=admission.doctor_name,
            doctor_code=admission.doctor_code,
            consultation_visit_number=admission.consultation_visit_number,
            bed_number=admission.bed_number,
            ward_name=admission.ward_name,
            discharged_by_name=admission.discharged_by_name,
        )


class AdmissionListResponse(BaseModel):
    items: list[AdmissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: AdmissionPage) -> "AdmissionListResponse":
        return cls(
            items=[AdmissionResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )
