from abc import ABC, abstractmethod

from app.modules.ai.domain.entities.ai_entities import AiRuntimeSettings
from app.modules.ai.domain.value_objects import ProviderId


class AiSettingsRepository(ABC):
    """Persists operator-selected AI runtime preferences."""

    @abstractmethod
    async def get(self) -> AiRuntimeSettings:
        """Return effective runtime settings."""

    @abstractmethod
    async def save(
        self,
        *,
        active_provider: ProviderId | None = None,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AiRuntimeSettings:
        """Update persisted settings and return the merged result."""
