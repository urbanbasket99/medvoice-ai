"""JWT-backed implementation of the `TokenService` port.

Access tokens are signed, stateless JWTs. Refresh tokens are opaque
`secrets.token_urlsafe` strings; only their SHA-256 hash is ever persisted
or compared, so this module never needs to store or transmit anything that
would let a database read alone impersonate a user.
"""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt

from app.application.interfaces.token_service import AccessTokenPayload
from app.core.config import get_settings
from app.domain.exceptions import InvalidAccessTokenError

_TOKEN_TYPE_CLAIM = "type"
_ACCESS_TOKEN_TYPE = "access"


class JwtTokenService:
    def __init__(self) -> None:
        settings = get_settings()
        self._secret_key = settings.jwt_secret_key
        self._algorithm = settings.jwt_algorithm
        self._access_token_expire_minutes = settings.access_token_expire_minutes

    @property
    def access_token_expires_in_seconds(self) -> int:
        return self._access_token_expire_minutes * 60

    def create_access_token(self, user_id: UUID, roles: list[str], permissions: list[str]) -> str:
        now = datetime.now(UTC)
        payload = {
            "sub": str(user_id),
            "roles": roles,
            "permissions": permissions,
            "iat": now,
            "exp": now + timedelta(minutes=self._access_token_expire_minutes),
            _TOKEN_TYPE_CLAIM: _ACCESS_TOKEN_TYPE,
        }
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode_access_token(self, token: str) -> AccessTokenPayload:
        try:
            payload = jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
        except jwt.PyJWTError as exc:
            raise InvalidAccessTokenError(str(exc)) from exc

        if payload.get(_TOKEN_TYPE_CLAIM) != _ACCESS_TOKEN_TYPE:
            raise InvalidAccessTokenError("Token is not an access token.")

        try:
            return AccessTokenPayload(
                user_id=UUID(payload["sub"]),
                roles=list(payload.get("roles", [])),
                permissions=list(payload.get("permissions", [])),
            )
        except (KeyError, ValueError) as exc:
            raise InvalidAccessTokenError("Access token payload is malformed.") from exc

    def generate_refresh_token(self) -> str:
        return secrets.token_urlsafe(64)

    def hash_refresh_token(self, raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
