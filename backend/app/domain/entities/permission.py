from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class Permission:
    """A single, fine-grained capability, e.g. ``"patients:read"``.

    Codes follow a ``resource:action`` convention so authorization checks
    and any future admin UI can group and search them predictably.
    """

    id: UUID
    code: str
    description: str
