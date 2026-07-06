from dataclasses import dataclass, field
from uuid import UUID

from app.domain.entities.permission import Permission


@dataclass(slots=True)
class Role:
    """A named collection of permissions, e.g. ``"doctor"`` or ``"admin"``.

    Roles are the unit assigned to a `User`; permissions are the unit
    checked at the API boundary — this indirection lets operators regroup
    permissions without touching every user record.
    """

    id: UUID
    name: str
    description: str
    permissions: list[Permission] = field(default_factory=list)

    def has_permission(self, code: str) -> bool:
        return any(permission.code == code for permission in self.permissions)
