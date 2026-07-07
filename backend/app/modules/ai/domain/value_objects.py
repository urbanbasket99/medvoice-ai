from enum import StrEnum


class ProviderId(StrEnum):
    OPENAI = "openai"
    AZURE_OPENAI = "azure_openai"
    GEMINI = "gemini"
    CLAUDE = "claude"
    LOCAL_LLM = "local_llm"


class ProviderStatus(StrEnum):
    ACTIVE = "active"
    PLACEHOLDER = "placeholder"
    UNAVAILABLE = "unavailable"


class HealthStatus(StrEnum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    NOT_CONFIGURED = "not_configured"


class Capability(StrEnum):
    SPEECH_TO_TEXT = "speech_to_text"
    TEXT_COMPLETION = "text_completion"
    STRUCTURED_JSON = "structured_json"
    STREAMING = "streaming"
    HEALTH_CHECK = "health_check"
