"""The `Doctor` aggregate: a registered doctor/physician record.

Framework-agnostic by design (plain dataclass + enums) so it can be unit
tested and passed between layers without ever importing SQLAlchemy or
Pydantic — mirrors `app.modules.patients.domain.entities.patient.Patient`.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class Department(str, Enum):
    CARDIOLOGY = "cardiology"
    NEUROLOGY = "neurology"
    ORTHOPEDICS = "orthopedics"
    PEDIATRICS = "pediatrics"
    GENERAL_MEDICINE = "general_medicine"
    DERMATOLOGY = "dermatology"
    ENT = "ent"
    GYNECOLOGY = "gynecology"
    PSYCHIATRY = "psychiatry"
    RADIOLOGY = "radiology"
    ANESTHESIOLOGY = "anesthesiology"
    SURGERY = "surgery"
    OPHTHALMOLOGY = "ophthalmology"
    UROLOGY = "urology"
    ONCOLOGY = "oncology"
    DENTISTRY = "dentistry"
    EMERGENCY_MEDICINE = "emergency_medicine"
    OTHER = "other"


class DoctorStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"


@dataclass(slots=True)
class Doctor:
    """A doctor's identity, professional, and contact record.

    Scheduling (appointments, availability slots) and clinical activity
    (consultations, prescriptions) live in their own future bounded
    contexts and are never embedded here — this entity is intentionally
    limited to what Doctor Management owns.
    """

    id: UUID
    doctor_code: str
    full_name: str
    gender: Gender
    date_of_birth: date
    department: Department
    specialization: str
    qualification: str
    registration_number: str
    experience_years: int
    mobile: str
    joining_date: date
    status: DoctorStatus
    created_at: datetime
    updated_at: datetime
    email: str | None = None
    address: str | None = None
    languages_spoken: list[str] = field(default_factory=list)
    consultation_fee: Decimal | None = None
    working_hours: str | None = None
    photo_url: str | None = None
    deleted_at: datetime | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    @property
    def age(self) -> int:
        today = date.today()
        had_birthday_this_year = (today.month, today.day) >= (
            self.date_of_birth.month,
            self.date_of_birth.day,
        )
        return today.year - self.date_of_birth.year - (0 if had_birthday_this_year else 1)
