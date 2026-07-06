"""Plain input objects consumed by the Patients use cases.

Not Pydantic models — request validation is a presentation-layer concern
(`app/modules/patients/presentation/schemas.py`). By the time a use case
receives one of these, the data has already been validated at the API
boundary.
"""

from dataclasses import dataclass
from datetime import date
from uuid import UUID

from app.modules.patients.domain.entities.patient import (
    BloodGroup,
    Gender,
    MaritalStatus,
    PatientStatus,
)


@dataclass(frozen=True, slots=True)
class CreatePatientInput:
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender
    mobile: str
    created_by: UUID | None = None
    registration_date: date | None = None
    middle_name: str | None = None
    blood_group: BloodGroup | None = None
    marital_status: MaritalStatus | None = None
    occupation: str | None = None
    alternate_mobile: str | None = None
    email: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    emergency_name: str | None = None
    emergency_relation: str | None = None
    emergency_mobile: str | None = None
    insurance_provider: str | None = None
    insurance_number: str | None = None
    allergies: str | None = None
    chronic_conditions: str | None = None
    notes: str | None = None


@dataclass(frozen=True, slots=True)
class UpdatePatientInput:
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender
    mobile: str
    status: PatientStatus
    updated_by: UUID | None = None
    registration_date: date | None = None
    middle_name: str | None = None
    blood_group: BloodGroup | None = None
    marital_status: MaritalStatus | None = None
    occupation: str | None = None
    alternate_mobile: str | None = None
    email: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    emergency_name: str | None = None
    emergency_relation: str | None = None
    emergency_mobile: str | None = None
    insurance_provider: str | None = None
    insurance_number: str | None = None
    allergies: str | None = None
    chronic_conditions: str | None = None
    notes: str | None = None
