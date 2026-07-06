"""Plain result objects returned by `AuthService`.

These are intentionally not Pydantic models — Pydantic (request/response
validation) is a presentation-layer concern. The API layer is responsible
for mapping these onto its own HTTP schemas.
"""

from dataclasses import dataclass

from app.domain.entities.user import User


@dataclass(frozen=True, slots=True)
class LoginResult:
    access_token: str
    refresh_token: str
    expires_in: int
    user: User


@dataclass(frozen=True, slots=True)
class RefreshResult:
    access_token: str
    refresh_token: str
    expires_in: int
