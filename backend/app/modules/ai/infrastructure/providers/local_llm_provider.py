from app.modules.ai.domain.value_objects import Capability, ProviderId
from app.modules.ai.infrastructure.providers.placeholder_provider import PlaceholderAIProvider


class LocalLLMProvider(PlaceholderAIProvider):
    def __init__(self) -> None:
        super().__init__(
            ProviderId.LOCAL_LLM,
            "Local LLM",
            "On-premise or local inference runtimes (Ollama, vLLM, etc.).",
            (
                Capability.TEXT_COMPLETION,
                Capability.STRUCTURED_JSON,
                Capability.STREAMING,
                Capability.HEALTH_CHECK,
            ),
        )
