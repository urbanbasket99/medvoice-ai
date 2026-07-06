"""Domain-level exceptions for the Patients bounded context.

Extends the shared `DomainError` base (see `app.domain.exceptions`) so a
single exception handler (`app/core/exceptions.py`) can translate errors
from every bounded context into HTTP responses uniformly.
"""

from app.domain.exceptions import DomainError


class PatientNotFoundError(DomainError):
    """Raised when a patient referenced by id/UHID does not exist or is soft-deleted."""


class DuplicateMobileNumberError(DomainError):
    """Raised when creating/updating a patient with a mobile number already registered."""


class DuplicateEmailError(DomainError):
    """Raised when creating/updating a patient with an email already registered."""
