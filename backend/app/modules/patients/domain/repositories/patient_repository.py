"""Abstract persistence contract for `Patient` aggregates.

The application layer (use cases) depends only on this interface, never on
the SQLAlchemy implementation — this is what makes every use case
unit-testable with an in-memory fake instead of a real database.
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.patients.domain.entities.patient import Patient
from app.modules.patients.domain.value_objects import PatientListCriteria, PatientPage


class PatientRepository(ABC):
    @abstractmethod
    async def get_by_id(self, patient_id: UUID) -> Patient | None: ...

    @abstractmethod
    async def get_by_uhid(self, uhid: str) -> Patient | None: ...

    @abstractmethod
    async def exists_by_mobile(self, mobile: str, exclude_id: UUID | None = None) -> bool: ...

    @abstractmethod
    async def exists_by_email(self, email: str, exclude_id: UUID | None = None) -> bool: ...

    @abstractmethod
    async def create(self, patient: Patient) -> Patient: ...

    @abstractmethod
    async def update(self, patient: Patient) -> Patient: ...

    @abstractmethod
    async def soft_delete(self, patient_id: UUID) -> bool:
        """Marks the patient deleted. Returns `False` if no matching active patient existed."""
        ...

    @abstractmethod
    async def list_patients(self, criteria: PatientListCriteria) -> PatientPage: ...

    @abstractmethod
    async def search_patients(self, query: str, page: int, page_size: int) -> PatientPage:
        """Free-text search across UHID, first/last name, mobile, and email."""
        ...
