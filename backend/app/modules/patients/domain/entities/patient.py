"""The `Patient` aggregate: a registered patient record.

Framework-agnostic by design (plain dataclass + enums) so it can be unit
tested and passed between layers without ever importing SQLAlchemy or
Pydantic — mirrors `app.domain.entities.user.User` in the Authentication
bounded context.
"""

from dataclasses import dataclass
from datetime import date, datetime
from enum import Enum
from uuid import UUID


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class BloodGroup(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    UNKNOWN = "unknown"


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"
    OTHER = "other"


class PatientStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DECEASED = "deceased"


@dataclass(slots=True)
class Patient:
    """A patient's identity, demographic, contact, and medical-summary record.

    Clinical history (consultations, prescriptions, lab results, billing)
    lives in its own future bounded contexts and is never embedded here —
    this entity is intentionally limited to what Patient Registration
    (Phase 1) owns.

    `created_by`/`updated_by` deliberately store only the acting user's
    `UUID`, never a `User` entity — the Patients bounded context must not
    depend on the Authentication module's domain model. Resolving those ids
    to display names is a presentation-layer/future-cross-module concern.
    """

    id: UUID
    mrn: str
    uhid: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender
    mobile: str
    status: PatientStatus
    registration_date: date
    created_at: datetime
    updated_at: datetime
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
    created_by: UUID | None = None
    updated_by: UUID | None = None
    deleted_at: datetime | None = None

    @property
    def full_name(self) -> str:
        parts = [self.first_name, self.middle_name, self.last_name]
        return " ".join(part for part in parts if part).strip()

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
