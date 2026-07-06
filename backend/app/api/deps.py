"""Dependency injection wiring for the presentation layer.

This module is the composition root for the auth bounded context: it is
the only place that imports both the abstract ports (`app.domain.*`,
`app.application.interfaces.*`) and their concrete adapters
(`app.infrastructure.*`), wiring them together behind FastAPI's `Depends`.
Route handlers only ever see the abstractions.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.interfaces.password_hasher import PasswordHasher
from app.application.interfaces.token_service import TokenService
from app.application.services.auth_service import AuthService
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.domain.entities.user import User
from app.domain.exceptions import PermissionDeniedError
from app.domain.repositories.refresh_token_repository import RefreshTokenRepository
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.repositories.sqlalchemy_refresh_token_repository import (
    SqlAlchemyRefreshTokenRepository,
)
from app.infrastructure.repositories.sqlalchemy_user_repository import SqlAlchemyUserRepository
from app.infrastructure.security.jwt_service import JwtTokenService
from app.infrastructure.security.password_hasher import BcryptPasswordHasher

_bearer_scheme = HTTPBearer(auto_error=False)

SettingsDep = Annotated[Settings, Depends(get_settings)]
DbSession = Annotated[AsyncSession, Depends(get_db)]


def get_user_repository(db: DbSession) -> UserRepository:
    return SqlAlchemyUserRepository(db)


def get_refresh_token_repository(db: DbSession) -> RefreshTokenRepository:
    return SqlAlchemyRefreshTokenRepository(db)


def get_password_hasher() -> PasswordHasher:
    return BcryptPasswordHasher()


def get_token_service() -> TokenService:
    return JwtTokenService()


def get_auth_service(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
    refresh_token_repository: Annotated[
        RefreshTokenRepository, Depends(get_refresh_token_repository)
    ],
    password_hasher: Annotated[PasswordHasher, Depends(get_password_hasher)],
    token_service: Annotated[TokenService, Depends(get_token_service)],
    settings: SettingsDep,
) -> AuthService:
    return AuthService(
        user_repository=user_repository,
        refresh_token_repository=refresh_token_repository,
        password_hasher=password_hasher,
        token_service=token_service,
        refresh_token_expire_days=settings.refresh_token_expire_days,
    )


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


async def get_current_user(
    auth_service: AuthServiceDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await auth_service.get_current_user(credentials.credentials)


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_permission(code: str):
    """Dependency factory: 403s unless the current user has `code`."""

    async def _dependency(user: CurrentUser) -> User:
        if not user.has_permission(code):
            raise PermissionDeniedError(f"Missing required permission: {code}")
        return user

    return _dependency


def require_role(name: str):
    """Dependency factory: 403s unless the current user has role `name` (or is a superuser)."""

    async def _dependency(user: CurrentUser) -> User:
        if not user.is_superuser and not user.has_role(name):
            raise PermissionDeniedError(f"Missing required role: {name}")
        return user

    return _dependency
