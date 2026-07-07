"""Domain-level exceptions for the Doctors bounded context.

Extends the shared `DomainError` base (see `app.domain.exceptions`) so a
single exception handler (`app/core/exceptions.py`) can translate errors
from every bounded context into HTTP responses uniformly. Exception names
are deliberately prefixed with `Doctor` where a Patients-context
equivalent already exists (`DuplicateMobileNumberError`,
`DuplicateEmailError`) to avoid ambiguity when both are imported side by
side in `app/core/exceptions.py`.
"""

from app.domain.exceptions import DomainError


class DoctorNotFoundError(DomainError):
    """Raised when a doctor referenced by id/doctor code does not exist or is soft-deleted."""


class DoctorMobileAlreadyRegisteredError(DomainError):
    """Raised when creating/updating a doctor with a mobile number already registered."""


class DoctorEmailAlreadyRegisteredError(DomainError):
    """Raised when creating/updating a doctor with an email already registered."""


class DuplicateRegistrationNumberError(DomainError):
    """Raised when creating/updating a doctor with a medical registration number already in use."""
