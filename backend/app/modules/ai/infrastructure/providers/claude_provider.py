from app.modules.ai.domain.value_objects import Capability, ProviderId
from app.modules.ai.infrastructure.providers.placeholder_provider import PlaceholderAIProvider


class ClaudeProvider(PlaceholderAIProvider):
    def __init__(self) -> None:
        super().__init__(
            ProviderId.CLAUDE,
            "Anthropic Claude",
            "Anthropic Claude family models.",
            (
                Capability.TEXT_COMPLETION,
                Capability.STRUCTURED_JSON,
                Capability.STREAMING,
                Capability.HEALTH_CHECK,
            ),
        )
