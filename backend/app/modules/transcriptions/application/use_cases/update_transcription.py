from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from app.modules.transcriptions.application.dto.transcription_dto import UpdateTranscriptionInput
from app.modules.transcriptions.domain.entities.transcription import TranscriptSegment, Transcription
from app.modules.transcriptions.domain.exceptions import TranscriptionInvalidStateError, TranscriptionNotFoundError
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository
from app.modules.transcriptions.domain.value_objects import TranscriptionStatus


class UpdateTranscriptionUseCase:
    def __init__(self, repository: TranscriptionRepository) -> None:
        self._transcriptions = repository

    async def execute(self, transcription_id: UUID, data: UpdateTranscriptionInput) -> Transcription:
        transcription = await self._transcriptions.get_by_id(transcription_id)
        if transcription is None:
            raise TranscriptionNotFoundError("Transcription not found.")
        if transcription.status != TranscriptionStatus.COMPLETED:
            raise TranscriptionInvalidStateError("Only completed transcriptions can be edited.")

        segments = transcription.segments
        if data.segments is not None:
            segments = tuple(
                TranscriptSegment(
                    index=int(item.get("index", idx)),
                    start_seconds=float(item.get("start_seconds") or 0),
                    end_seconds=float(item.get("end_seconds") or 0),
                    text=str(item.get("text") or ""),
                    speaker_label=str(item.get("speaker_label") or "Speaker 1"),
                    confidence=item.get("confidence"),
                )
                for idx, item in enumerate(data.segments)
            )

        updated = replace(
            transcription,
            transcript=data.transcript.strip(),
            segments=segments,
            updated_at=datetime.now(UTC),
        )
        return await self._transcriptions.update(updated)
