"""Authentication use cases: login, refresh, logout, current user, change password.

`AuthService` depends only on the ports declared in
`app.domain.repositories` and `app.application.interfaces` — never on
SQLAlchemy, `passlib` or `PyJWT` directly. Concrete adapters are wired in
by `app/api/deps.py`, which is what makes this class trivial to unit test
with in-memory fakes.
"""

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from app.application.dto.auth import LoginResult, RefreshResult
from app.application.interfaces.password_hasher import PasswordHasher
from app.application.interfaces.token_service import TokenService
from app.domain.entities.refresh_token import RefreshToken
from app.domain.entities.user import User
from app.domain.exceptions import (
    InvalidCredentialsError,
    InvalidCurrentPasswordError,
    InvalidRefreshTokenError,
    RefreshTokenExpiredError,
    RefreshTokenReusedError,
    UserInactiveError,
    UserNotFoundError,
)
from app.domain.repositories.refresh_token_repository import RefreshTokenRepository
from app.domain.repositories.user_repository import UserRepository


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
        password_hasher: PasswordHasher,
        token_service: TokenService,
        refresh_token_expire_days: int,
    ) -> None:
        self._users = user_repository
        self._refresh_tokens = refresh_token_repository
        self._password_hasher = password_hasher
        self._tokens = token_service
        self._refresh_token_expire_days = refresh_token_expire_days

    async def login(self, email: str, password: str) -> LoginResult:
        user = await self._users.get_by_email(email)
        if user is None or not self._password_hasher.verify(password, user.hashed_password):
            raise InvalidCredentialsError()
        if not user.is_active:
            raise UserInactiveError()

        access_token = self._issue_access_token(user)
        raw_refresh_token = await self._issue_refresh_token(user.id)

        return LoginResult(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            expires_in=self._tokens.access_token_expires_in_seconds,
            user=user,
        )

    async def refresh(self, raw_refresh_token: str) -> RefreshResult:
        token_hash = self._tokens.hash_refresh_token(raw_refresh_token)
        stored = await self._refresh_tokens.get_by_token_hash(token_hash)
        if stored is None:
            raise InvalidRefreshTokenError()

        now = datetime.now(UTC)
        if stored.is_revoked:
            # A previously-rotated token being reused is a signal of theft:
            # kill the whole session family rather than just this token.
            await self._refresh_tokens.revoke_all_for_user(stored.user_id)
            raise RefreshTokenReusedError()
        if stored.is_expired(now):
            raise RefreshTokenExpiredError()

        user = await self._users.get_by_id(stored.user_id)
        if user is None:
            raise UserNotFoundError()
        if not user.is_active:
            raise UserInactiveError()

        new_raw_refresh_token = await self._issue_refresh_token(user.id, rotated_from=stored.id)
        access_token = self._issue_access_token(user)

        return RefreshResult(
            access_token=access_token,
            refresh_token=new_raw_refresh_token,
            expires_in=self._tokens.access_token_expires_in_seconds,
        )

    async def logout(self, raw_refresh_token: str) -> None:
        token_hash = self._tokens.hash_refresh_token(raw_refresh_token)
        stored = await self._refresh_tokens.get_by_token_hash(token_hash)
        if stored is not None and not stored.is_revoked:
            await self._refresh_tokens.revoke(stored.id)

    async def get_current_user(self, access_token: str) -> User:
        payload = self._tokens.decode_access_token(access_token)
        user = await self._users.get_by_id(payload.user_id)
        if user is None:
            raise UserNotFoundError()
        if not user.is_active:
            raise UserInactiveError()
        return user

    async def change_password(self, user_id: UUID, current_password: str, new_password: str) -> None:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError()
        if not self._password_hasher.verify(current_password, user.hashed_password):
            raise InvalidCurrentPasswordError()

        new_hashed_password = self._password_hasher.hash(new_password)
        await self._users.update_password(user_id, new_hashed_password)
        # Force re-authentication on every other device/session.
        await self._refresh_tokens.revoke_all_for_user(user_id)

    def _issue_access_token(self, user: User) -> str:
        return self._tokens.create_access_token(
            user_id=user.id,
            roles=user.role_names,
            permissions=user.permission_codes,
        )

    async def _issue_refresh_token(self, user_id: UUID, rotated_from: UUID | None = None) -> str:
        raw_token = self._tokens.generate_refresh_token()
        now = datetime.now(UTC)
        entity = RefreshToken(
            id=uuid4(),
            user_id=user_id,
            token_hash=self._tokens.hash_refresh_token(raw_token),
            expires_at=now + timedelta(days=self._refresh_token_expire_days),
            created_at=now,
        )
        created = await self._refresh_tokens.create(entity)
        if rotated_from is not None:
            await self._refresh_tokens.revoke(rotated_from, replaced_by_token_id=created.id)
        return raw_token
