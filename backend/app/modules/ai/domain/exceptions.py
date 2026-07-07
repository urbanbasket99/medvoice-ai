from app.domain.exceptions import DomainError


class AIError(DomainError):
    """Base exception for the AI Engine bounded context."""


class AIProviderNotFoundError(AIError):
    """Raised when the requested provider is unknown."""


class AIProviderNotAvailableError(AIError):
    """Raised when a placeholder or inactive provider is invoked."""


class AIProviderConfigurationError(AIError):
    """Raised when provider credentials or settings are missing or invalid."""


class AIProviderHealthCheckError(AIError):
    """Raised when a provider health probe fails unexpectedly."""


class AIProviderRequestError(AIError):
    """Raised when an upstream provider request fails."""


class AICapabilityNotSupportedError(AIError):
    """Raised when a capability exists in the interface but is not enabled yet."""
