from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.transcriptions.domain.entities.transcription import (
    Transcription,
    TranscriptionListCriteria,
    TranscriptionPage,
)


class TranscriptionRepository(ABC):
    @abstractmethod
    async def create(self, transcription: Transcription) -> Transcription:
        """Persist a new transcription."""

    @abstractmethod
    async def update(self, transcription: Transcription) -> Transcription:
        """Update an existing transcription."""

    @abstractmethod
    async def get_by_id(self, transcription_id: UUID) -> Transcription | None:
        """Fetch a transcription by primary key."""

    @abstractmethod
    async def get_by_recording_id(self, recording_id: UUID) -> Transcription | None:
        """Fetch the latest transcription for a voice recording."""

    @abstractmethod
    async def list(self, criteria: TranscriptionListCriteria) -> TranscriptionPage:
        """List transcriptions with pagination."""

    @abstractmethod
    async def soft_delete(self, transcription_id: UUID) -> None:
        """Soft-delete a transcription."""
