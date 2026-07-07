"""Abstract persistence contract for `Doctor` aggregates.

The application layer (use cases) depends only on this interface, never on
the SQLAlchemy implementation — this is what makes every use case
unit-testable with an in-memory fake instead of a real database.
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.doctors.domain.entities.doctor import Doctor
from app.modules.doctors.domain.value_objects import DoctorListCriteria, DoctorPage


class DoctorRepository(ABC):
    @abstractmethod
    async def get_by_id(self, doctor_id: UUID) -> Doctor | None: ...

    @abstractmethod
    async def get_by_code(self, doctor_code: str) -> Doctor | None: ...

    @abstractmethod
    async def exists_by_mobile(self, mobile: str, exclude_id: UUID | None = None) -> bool: ...

    @abstractmethod
    async def exists_by_email(self, email: str, exclude_id: UUID | None = None) -> bool: ...

    @abstractmethod
    async def exists_by_registration_number(
        self, registration_number: str, exclude_id: UUID | None = None
    ) -> bool: ...

    @abstractmethod
    async def create(self, doctor: Doctor) -> Doctor: ...

    @abstractmethod
    async def update(self, doctor: Doctor) -> Doctor: ...

    @abstractmethod
    async def soft_delete(self, doctor_id: UUID) -> bool:
        """Marks the doctor deleted. Returns `False` if no matching active doctor existed."""
        ...

    @abstractmethod
    async def list_doctors(self, criteria: DoctorListCriteria) -> DoctorPage: ...

    @abstractmethod
    async def search_doctors(self, query: str, page: int, page_size: int) -> DoctorPage:
        """Free-text search across doctor code, name, registration number, mobile, and email."""
        ...
