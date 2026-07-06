"""Domain-level exceptions for the authentication bounded context.

These carry no HTTP semantics — the presentation layer (see
`app/core/exceptions.py`) is responsible for translating them into the
appropriate HTTP responses. Keeping them framework-agnostic means the same
domain/application code could sit behind a REST API, a CLI or a message
consumer without modification.
"""


class DomainError(Exception):
    """Base class for all domain errors raised by the auth bounded context."""


class InvalidCredentialsError(DomainError):
    """Raised when an email/password combination does not match a user."""


class UserInactiveError(DomainError):
    """Raised when a user authenticates successfully but their account is disabled."""


class UserNotFoundError(DomainError):
    """Raised when a user referenced by id/email does not exist."""


class EmailAlreadyRegisteredError(DomainError):
    """Raised when attempting to register a user with an email already in use."""


class InvalidAccessTokenError(DomainError):
    """Raised when a bearer access token is malformed, expired or has a bad signature."""


class InvalidRefreshTokenError(DomainError):
    """Raised when a presented refresh token is malformed or unknown."""


class RefreshTokenExpiredError(DomainError):
    """Raised when a refresh token is well-formed but past its expiry."""


class RefreshTokenReusedError(DomainError):
    """Raised when an already-rotated (revoked) refresh token is presented again.

    This is treated as a possible token-theft signal; callers should react by
    revoking the entire token family for the affected user.
    """


class InvalidCurrentPasswordError(DomainError):
    """Raised when a change-password request supplies the wrong current password."""


class PermissionDeniedError(DomainError):
    """Raised when an authenticated user lacks a required role or permission."""
