"""Plain input objects consumed by the Doctors use cases.

Not Pydantic models — request validation is a presentation-layer concern
(`app/modules/doctors/presentation/schemas.py`). By the time a use case
receives one of these, the data has already been validated at the API
boundary.
"""

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal

from app.modules.doctors.domain.entities.doctor import Department, DoctorStatus, Gender


@dataclass(frozen=True, slots=True)
class CreateDoctorInput:
    full_name: str
    gender: Gender
    date_of_birth: date
    department: Department
    specialization: str
    qualification: str
    registration_number: str
    experience_years: int
    mobile: str
    joining_date: date | None = None
    email: str | None = None
    address: str | None = None
    languages_spoken: list[str] = field(default_factory=list)
    consultation_fee: Decimal | None = None
    working_hours: str | None = None
    photo_url: str | None = None


@dataclass(frozen=True, slots=True)
class UpdateDoctorInput:
    full_name: str
    gender: Gender
    date_of_birth: date
    department: Department
    specialization: str
    qualification: str
    registration_number: str
    experience_years: int
    mobile: str
    status: DoctorStatus
    joining_date: date | None = None
    email: str | None = None
    address: str | None = None
    languages_spoken: list[str] = field(default_factory=list)
    consultation_fee: Decimal | None = None
    working_hours: str | None = None
    photo_url: str | None = None
