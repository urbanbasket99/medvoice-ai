from app.modules.ai.domain.value_objects import Capability, ProviderId
from app.modules.ai.infrastructure.providers.placeholder_provider import PlaceholderAIProvider


class GeminiProvider(PlaceholderAIProvider):
    def __init__(self) -> None:
        super().__init__(
            ProviderId.GEMINI,
            "Google Gemini",
            "Google Gemini multimodal models.",
            (
                Capability.TEXT_COMPLETION,
                Capability.STRUCTURED_JSON,
                Capability.STREAMING,
                Capability.HEALTH_CHECK,
                Capability.SPEECH_TO_TEXT,
            ),
        )
