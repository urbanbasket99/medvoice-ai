"""Pydantic request/response models for the Doctors API.

Reuses the domain's `Gender`/`Department`/`DoctorStatus` enums directly
(rather than redefining presentation-layer copies) since they carry no
framework dependency and Pydantic validates `str` enums natively.

"Standard API response" for this bounded context mirrors the Patients
module exactly: a single resource is returned as its full representation
(`DoctorResponse`), a collection is returned as a paginated envelope
(`DoctorListResponse` — `items` / `total` / `page` / `page_size` /
`total_pages`), and every error is returned in the single uniform shape
already established by `app.core.exceptions`
(`{"detail": ..., "error_type": ...}`).
"""

from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.modules.doctors.application.dto.availability_dto import (
    AvailabilitySlotInput,
    ReplaceAvailabilityInput,
)
from app.modules.doctors.domain.entities.doctor import Department, Doctor, DoctorStatus, Gender
from app.modules.doctors.domain.entities.doctor_availability_slot import DoctorAvailabilitySlot
from app.modules.doctors.domain.value_objects import DoctorPage


class DoctorBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    gender: Gender
    date_of_birth: date
    department: Department
    specialization: str = Field(min_length=1, max_length=150)
    qualification: str = Field(min_length=1, max_length=255)
    registration_number: str = Field(min_length=1, max_length=100)
    experience_years: int = Field(ge=0, le=80)

    mobile: str = Field(min_length=7, max_length=20)
    email: EmailStr | None = None
    address: str | None = None

    languages_spoken: list[str] = Field(default_factory=list)
    consultation_fee: Decimal | None = Field(default=None, ge=0)
    working_hours: str | None = Field(default=None, max_length=255)
    photo_url: str | None = Field(default=None, max_length=500)

    joining_date: date | None = None

    @field_validator("date_of_birth")
    @classmethod
    def _date_of_birth_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("date_of_birth cannot be in the future")
        return value

    @field_validator("joining_date")
    @classmethod
    def _joining_date_not_in_future(cls, value: date | None) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("joining_date cannot be in the future")
        return value


class DoctorCreateRequest(DoctorBase):
    pass


class DoctorUpdateRequest(DoctorBase):
    status: DoctorStatus = DoctorStatus.ACTIVE


class DoctorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    doctor_code: str
    full_name: str
    age: int
    gender: Gender
    date_of_birth: date
    department: Department
    specialization: str
    qualification: str
    registration_number: str
    experience_years: int
    mobile: str
    email: str | None
    address: str | None
    languages_spoken: list[str]
    consultation_fee: Decimal | None
    working_hours: str | None
    photo_url: str | None
    joining_date: date
    status: DoctorStatus
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, doctor: Doctor) -> "DoctorResponse":
        return cls(
            id=doctor.id,
            doctor_code=doctor.doctor_code,
            full_name=doctor.full_name,
            age=doctor.age,
            gender=doctor.gender,
            date_of_birth=doctor.date_of_birth,
            department=doctor.department,
            specialization=doctor.specialization,
            qualification=doctor.qualification,
            registration_number=doctor.registration_number,
            experience_years=doctor.experience_years,
            mobile=doctor.mobile,
            email=doctor.email,
            address=doctor.address,
            languages_spoken=doctor.languages_spoken,
            consultation_fee=doctor.consultation_fee,
            working_hours=doctor.working_hours,
            photo_url=doctor.photo_url,
            joining_date=doctor.joining_date,
            status=doctor.status,
            created_at=doctor.created_at,
            updated_at=doctor.updated_at,
        )


class DoctorListResponse(BaseModel):
    items: list[DoctorResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: DoctorPage) -> "DoctorListResponse":
        return cls(
            items=[DoctorResponse.from_entity(doctor) for doctor in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class AvailabilitySlotRequest(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    slot_minutes: int = Field(default=30, ge=5, le=480)
    is_active: bool = True

    def to_input(self) -> AvailabilitySlotInput:
        return AvailabilitySlotInput(
            day_of_week=self.day_of_week,
            start_time=self.start_time,
            end_time=self.end_time,
            slot_minutes=self.slot_minutes,
            is_active=self.is_active,
        )


class DoctorAvailabilityReplaceRequest(BaseModel):
    slots: list[AvailabilitySlotRequest] = Field(default_factory=list)

    def to_input(self) -> ReplaceAvailabilityInput:
        return ReplaceAvailabilityInput(slots=tuple(slot.to_input() for slot in self.slots))


class AvailabilitySlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    doctor_id: UUID
    day_of_week: int
    start_time: time
    end_time: time
    slot_minutes: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, slot: DoctorAvailabilitySlot) -> "AvailabilitySlotResponse":
        return cls(
            id=slot.id,
            doctor_id=slot.doctor_id,
            day_of_week=slot.day_of_week,
            start_time=slot.start_time,
            end_time=slot.end_time,
            slot_minutes=slot.slot_minutes,
            is_active=slot.is_active,
            created_at=slot.created_at,
            updated_at=slot.updated_at,
        )
