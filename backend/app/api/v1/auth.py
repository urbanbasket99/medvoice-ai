"""Authentication endpoints.

The refresh token is transported exclusively as an `httpOnly` cookie
(never in the JSON body or `localStorage`) so it is inaccessible to
JavaScript and therefore to XSS. The access token, by contrast, is short
lived and returned in the response body for the SPA to hold in memory and
send as a `Bearer` header.
"""

from fastapi import APIRouter, Request, Response, status

from app.api.deps import AuthServiceDep, CurrentUser, SettingsDep
from app.api.schemas.auth import (
    AccessTokenResponse,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    UserResponse,
)
from app.core.config import Settings
from app.domain.exceptions import InvalidRefreshTokenError

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=token,
        httponly=True,
        secure=settings.refresh_token_cookie_secure,
        samesite=settings.refresh_token_cookie_samesite,
        path=settings.refresh_token_cookie_path,
        domain=settings.refresh_token_cookie_domain or None,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


def _clear_refresh_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        key=settings.refresh_token_cookie_name,
        path=settings.refresh_token_cookie_path,
        domain=settings.refresh_token_cookie_domain or None,
    )


def _read_refresh_cookie(request: Request, settings: Settings) -> str:
    token = request.cookies.get(settings.refresh_token_cookie_name)
    if not token:
        raise InvalidRefreshTokenError("No refresh token cookie was presented.")
    return token


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    auth_service: AuthServiceDep,
    settings: SettingsDep,
) -> LoginResponse:
    result = await auth_service.login(email=payload.email, password=payload.password)
    _set_refresh_cookie(response, result.refresh_token, settings)
    return LoginResponse(
        access_token=result.access_token,
        expires_in=result.expires_in,
        user=UserResponse.from_entity(result.user),
    )


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(
    request: Request,
    response: Response,
    auth_service: AuthServiceDep,
    settings: SettingsDep,
) -> AccessTokenResponse:
    raw_refresh_token = _read_refresh_cookie(request, settings)
    result = await auth_service.refresh(raw_refresh_token)
    _set_refresh_cookie(response, result.refresh_token, settings)
    return AccessTokenResponse(access_token=result.access_token, expires_in=result.expires_in)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    auth_service: AuthServiceDep,
    settings: SettingsDep,
) -> MessageResponse:
    raw_refresh_token = request.cookies.get(settings.refresh_token_cookie_name)
    if raw_refresh_token:
        await auth_service.logout(raw_refresh_token)
    _clear_refresh_cookie(response, settings)
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.from_entity(current_user)


@router.post(
    "/change-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    auth_service: AuthServiceDep,
) -> MessageResponse:
    await auth_service.change_password(
        user_id=current_user.id,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return MessageResponse(message="Password changed successfully. Please sign in again on other devices.")
