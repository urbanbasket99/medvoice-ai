from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class RefreshToken:
    """A single issued refresh token, stored server-side as a salted hash.

    Refresh tokens are rotated on every use (see `AuthService.refresh`):
    presenting a token marks it revoked and links it to its replacement via
    `replaced_by_token_id`, so a reused, already-rotated token is a strong
    signal of token theft (`RefreshTokenReusedError`).
    """

    id: UUID
    user_id: UUID
    token_hash: str
    expires_at: datetime
    created_at: datetime
    revoked_at: datetime | None = None
    replaced_by_token_id: UUID | None = None

    @property
    def is_revoked(self) -> bool:
        return self.revoked_at is not None

    def is_expired(self, now: datetime) -> bool:
        return now >= self.expires_at

    def is_usable(self, now: datetime) -> bool:
        return not self.is_revoked and not self.is_expired(now)
