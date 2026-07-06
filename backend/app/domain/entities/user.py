from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from app.domain.entities.role import Role


@dataclass(slots=True)
class User:
    """The authenticated principal of the system.

    Carries its assigned `Role`s (and, transitively, their `Permission`s)
    so authorization decisions (`has_role`, `has_permission`) can be made
    without any additional database round-trip once the user is loaded.
    """

    id: UUID
    email: str
    hashed_password: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    roles: list[Role] = field(default_factory=list)

    def has_role(self, name: str) -> bool:
        return any(role.name == name for role in self.roles)

    def has_permission(self, code: str) -> bool:
        return self.is_superuser or any(role.has_permission(code) for role in self.roles)

    @property
    def permission_codes(self) -> list[str]:
        codes = {permission.code for role in self.roles for permission in role.permissions}
        return sorted(codes)

    @property
    def role_names(self) -> list[str]:
        return sorted({role.name for role in self.roles})
