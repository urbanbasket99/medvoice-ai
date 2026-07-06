"""Maps domain exceptions to HTTP responses.

This is the only place in the codebase that should know both about
`app.domain.exceptions` and about HTTP status codes — it is the seam
between the framework-agnostic domain layer and the FastAPI presentation
layer.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    DomainError,
    EmailAlreadyRegisteredError,
    InvalidAccessTokenError,
    InvalidCredentialsError,
    InvalidCurrentPasswordError,
    InvalidRefreshTokenError,
    PermissionDeniedError,
    RefreshTokenExpiredError,
    RefreshTokenReusedError,
    UserInactiveError,
    UserNotFoundError,
)
from app.modules.patients.domain.exceptions import (
    DuplicateEmailError,
    DuplicateMobileNumberError,
    PatientNotFoundError,
)

_STATUS_BY_ERROR: dict[type[DomainError], int] = {
    InvalidCredentialsError: status.HTTP_401_UNAUTHORIZED,
    UserInactiveError: status.HTTP_403_FORBIDDEN,
    UserNotFoundError: status.HTTP_404_NOT_FOUND,
    EmailAlreadyRegisteredError: status.HTTP_409_CONFLICT,
    InvalidAccessTokenError: status.HTTP_401_UNAUTHORIZED,
    InvalidRefreshTokenError: status.HTTP_401_UNAUTHORIZED,
    RefreshTokenExpiredError: status.HTTP_401_UNAUTHORIZED,
    RefreshTokenReusedError: status.HTTP_401_UNAUTHORIZED,
    InvalidCurrentPasswordError: status.HTTP_400_BAD_REQUEST,
    PermissionDeniedError: status.HTTP_403_FORBIDDEN,
    PatientNotFoundError: status.HTTP_404_NOT_FOUND,
    DuplicateMobileNumberError: status.HTTP_409_CONFLICT,
    DuplicateEmailError: status.HTTP_409_CONFLICT,
}

_DEFAULT_MESSAGE_BY_ERROR: dict[type[DomainError], str] = {
    InvalidCredentialsError: "Invalid email or password.",
    UserInactiveError: "This account has been deactivated.",
    UserNotFoundError: "User not found.",
    EmailAlreadyRegisteredError: "An account with this email already exists.",
    InvalidAccessTokenError: "Invalid or expired access token.",
    InvalidRefreshTokenError: "Invalid or unrecognized refresh token.",
    RefreshTokenExpiredError: "Session expired. Please sign in again.",
    RefreshTokenReusedError: "Session revoked for security reasons. Please sign in again.",
    InvalidCurrentPasswordError: "Current password is incorrect.",
    PermissionDeniedError: "You do not have permission to perform this action.",
    PatientNotFoundError: "Patient not found.",
    DuplicateMobileNumberError: "A patient with this mobile number is already registered.",
    DuplicateEmailError: "A patient with this email is already registered.",
}


def _resolve_status(error: DomainError) -> int:
    for error_type, http_status in _STATUS_BY_ERROR.items():
        if isinstance(error, error_type):
            return http_status
    return status.HTTP_400_BAD_REQUEST


def _resolve_message(error: DomainError) -> str:
    for error_type, message in _DEFAULT_MESSAGE_BY_ERROR.items():
        if isinstance(error, error_type):
            return str(error) or message
    return str(error) or "An unexpected error occurred."


async def _domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(
        status_code=_resolve_status(exc),
        content={"detail": _resolve_message(exc), "error_type": type(exc).__name__},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI application."""
    app.add_exception_handler(DomainError, _domain_error_handler)
