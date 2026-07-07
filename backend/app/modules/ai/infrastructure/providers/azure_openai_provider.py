from app.modules.ai.domain.value_objects import Capability, ProviderId
from app.modules.ai.infrastructure.providers.placeholder_provider import PlaceholderAIProvider


class AzureOpenAIProvider(PlaceholderAIProvider):
    def __init__(self) -> None:
        super().__init__(
            ProviderId.AZURE_OPENAI,
            "Azure OpenAI",
            "Enterprise Azure-hosted OpenAI deployments.",
            (
                Capability.TEXT_COMPLETION,
                Capability.STRUCTURED_JSON,
                Capability.STREAMING,
                Capability.HEALTH_CHECK,
                Capability.SPEECH_TO_TEXT,
            ),
        )
