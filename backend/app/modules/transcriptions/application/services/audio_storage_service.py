from abc import ABC, abstractmethod
from uuid import UUID


class AudioStorageService(ABC):
    @abstractmethod
    async def save(self, transcription_id: UUID, file_name: str, content: bytes) -> tuple[str, int]:
        """Persist uploaded audio and return storage path and byte size."""

    @abstractmethod
    def resolve(self, storage_path: str) -> str:
        """Resolve a stored path for downstream processing."""

    @abstractmethod
    def delete(self, storage_path: str) -> None:
        """Remove stored audio if present."""
