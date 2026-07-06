"""Pydantic request/response models for the Patients API.

Reuses the domain's `Gender`/`BloodGroup`/`MaritalStatus`/`PatientStatus`
enums directly (rather than redefining presentation-layer copies) since they
carry no framework dependency and Pydantic validates `str` enums natively.

"Standard API response" for this bounded context means: a single resource
is returned as its full representation (`PatientResponse`), a collection is
returned as a paginated envelope (`PatientListResponse` — `items` / `total`
/ `page` / `page_size` / `total_pages`), and every error — validation or
domain — is returned in the single uniform shape already established by
`app.core.exceptions` (`{"detail": ..., "error_type": ...}`). A generic
`{success, data, error}` wrapper was deliberately not introduced: it would
be inconsistent with every other endpoint in the API (Authentication
returns bare resources too) and touching the shared response contract is
out of scope for a single bounded context.
"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.modules.patients.domain.entities.patient import (
    BloodGroup,
    Gender,
    MaritalStatus,
    Patient,
    PatientStatus,
)
from app.modules.patients.domain.value_objects import PatientPage


class PatientBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    gender: Gender
    blood_group: BloodGroup | None = None
    marital_status: MaritalStatus | None = None
    occupation: str | None = Field(default=None, max_length=150)

    mobile: str = Field(min_length=7, max_length=20)
    alternate_mobile: str | None = Field(default=None, min_length=7, max_length=20)
    email: EmailStr | None = None

    address_line1: str | None = Field(default=None, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)

    emergency_name: str | None = Field(default=None, max_length=150)
    emergency_relation: str | None = Field(default=None, max_length=50)
    emergency_mobile: str | None = Field(default=None, max_length=20)

    insurance_provider: str | None = Field(default=None, max_length=150)
    insurance_number: str | None = Field(default=None, max_length=100)

    allergies: str | None = None
    chronic_conditions: str | None = None
    notes: str | None = None

    registration_date: date | None = None

    @field_validator("date_of_birth")
    @classmethod
    def _date_of_birth_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("date_of_birth cannot be in the future")
        return value

    @field_validator("registration_date")
    @classmethod
    def _registration_date_not_in_future(cls, value: date | None) -> date | None:
        if value is not None and value > date.today():
            raise ValueError("registration_date cannot be in the future")
        return value


class PatientCreateRequest(PatientBase):
    pass


class PatientUpdateRequest(PatientBase):
    status: PatientStatus = PatientStatus.ACTIVE


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mrn: str
    uhid: str
    first_name: str
    middle_name: str | None
    last_name: str
    full_name: str
    date_of_birth: date
    age: int
    gender: Gender
    blood_group: BloodGroup | None
    marital_status: MaritalStatus | None
    occupation: str | None
    mobile: str
    alternate_mobile: str | None
    email: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    country: str | None
    postal_code: str | None
    emergency_name: str | None
    emergency_relation: str | None
    emergency_mobile: str | None
    insurance_provider: str | None
    insurance_number: str | None
    allergies: str | None
    chronic_conditions: str | None
    notes: str | None
    registration_date: date
    status: PatientStatus
    created_at: datetime
    updated_at: datetime
    created_by: UUID | None
    updated_by: UUID | None

    @classmethod
    def from_entity(cls, patient: Patient) -> "PatientResponse":
        return cls(
            id=patient.id,
            mrn=patient.mrn,
            uhid=patient.uhid,
            first_name=patient.first_name,
            middle_name=patient.middle_name,
            last_name=patient.last_name,
            full_name=patient.full_name,
            date_of_birth=patient.date_of_birth,
            age=patient.age,
            gender=patient.gender,
            blood_group=patient.blood_group,
            marital_status=patient.marital_status,
            occupation=patient.occupation,
            mobile=patient.mobile,
            alternate_mobile=patient.alternate_mobile,
            email=patient.email,
            address_line1=patient.address_line1,
            address_line2=patient.address_line2,
            city=patient.city,
            state=patient.state,
            country=patient.country,
            postal_code=patient.postal_code,
            emergency_name=patient.emergency_name,
            emergency_relation=patient.emergency_relation,
            emergency_mobile=patient.emergency_mobile,
            insurance_provider=patient.insurance_provider,
            insurance_number=patient.insurance_number,
            allergies=patient.allergies,
            chronic_conditions=patient.chronic_conditions,
            notes=patient.notes,
            registration_date=patient.registration_date,
            status=patient.status,
            created_at=patient.created_at,
            updated_at=patient.updated_at,
            created_by=patient.created_by,
            updated_by=patient.updated_by,
        )


class PatientListResponse(BaseModel):
    items: list[PatientResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: PatientPage) -> "PatientListResponse":
        return cls(
            items=[PatientResponse.from_entity(patient) for patient in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )
