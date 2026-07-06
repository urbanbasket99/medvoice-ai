"""Port for token creation/verification.

Access tokens are short-lived, stateless JWTs (never persisted). Refresh
tokens are long-lived, opaque random strings — only their SHA-256 hash is
persisted (see `RefreshTokenRepository`), so a database leak alone cannot
be used to mint valid sessions.
"""

from dataclasses import dataclass
from typing import Protocol
from uuid import UUID


@dataclass(frozen=True, slots=True)
class AccessTokenPayload:
    user_id: UUID
    roles: list[str]
    permissions: list[str]


class TokenService(Protocol):
    @property
    def access_token_expires_in_seconds(self) -> int: ...

    def create_access_token(self, user_id: UUID, roles: list[str], permissions: list[str]) -> str: ...

    def decode_access_token(self, token: str) -> AccessTokenPayload: ...

    def generate_refresh_token(self) -> str: ...

    def hash_refresh_token(self, raw_token: str) -> str: ...
