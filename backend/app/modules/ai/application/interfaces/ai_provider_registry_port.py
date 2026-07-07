from abc import ABC, abstractmethod

from app.modules.ai.application.interfaces.ai_provider_port import AIProviderPort
from app.modules.ai.domain.value_objects import ProviderId


class AIProviderRegistryPort(ABC):
    @abstractmethod
    def all(self) -> list[AIProviderPort]:
        """Return every registered provider adapter."""

    @abstractmethod
    def get(self, provider_id: ProviderId) -> AIProviderPort | None:
        """Resolve a provider by id."""

    @abstractmethod
    def require(self, provider_id: ProviderId) -> AIProviderPort:
        """Resolve a provider or raise if missing."""
