"""Abstract persistence contract for `User` aggregates.

The application layer depends only on this interface, never on the
SQLAlchemy implementation — this is the Dependency Inversion half of
Clean Architecture and is what makes `AuthService` unit-testable with an
in-memory fake instead of a real database.
"""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.user import User


class UserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None: ...

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool: ...

    @abstractmethod
    async def update_password(self, user_id: UUID, hashed_password: str) -> None: ...
