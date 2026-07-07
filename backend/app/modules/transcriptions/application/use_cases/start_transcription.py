from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.transcriptions.application.dto.transcription_dto import StartTranscriptionInput
from app.modules.transcriptions.application.interfaces.voice_recording_lookup import VoiceRecordingLookup
from app.modules.transcriptions.application.services.speech_to_text_service import SpeechToTextService
from app.modules.transcriptions.domain.entities.transcription import Transcription
from app.modules.transcriptions.domain.exceptions import (
    TranscriptionInvalidStateError,
    TranscriptionNotFoundError,
    TranscriptionProcessingError,
    TranscriptionRecordingNotFoundError,
    TranscriptionRecordingNotReadyError,
)
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository
from app.modules.transcriptions.domain.value_objects import TranscriptionStatus


class StartTranscriptionUseCase:
    def __init__(
        self,
        repository: TranscriptionRepository,
        speech_to_text_service: SpeechToTextService,
        voice_recording_lookup: VoiceRecordingLookup,
    ) -> None:
        self._transcriptions = repository
        self._speech_to_text = speech_to_text_service
        self._recordings = voice_recording_lookup

    async def execute(self, data: StartTranscriptionInput) -> Transcription:
        """Start processing synchronously (used in tests). Prefer start_processing + background task in API."""
        processing = await self.start_processing(data)
        if processing.status == TranscriptionStatus.PROCESSING:
            await self.complete_processing(processing.id, data.language)
            refreshed = await self._transcriptions.get_by_id(processing.id)
            assert refreshed is not None
            return refreshed
        return processing

    async def start_processing(self, data: StartTranscriptionInput) -> Transcription:
        transcription = await self._resolve_transcription(data)
        if transcription.status == TranscriptionStatus.COMPLETED:
            return transcription
        if transcription.status == TranscriptionStatus.PROCESSING:
            return transcription
        if transcription.status not in {
            TranscriptionStatus.PENDING,
            TranscriptionStatus.FAILED,
        }:
            raise TranscriptionInvalidStateError("Only pending or failed transcriptions can be started.")

        processing = replace(
            transcription,
            status=TranscriptionStatus.PROCESSING,
            error_message=None,
            updated_at=datetime.now(UTC),
        )
        return await self._transcriptions.update(processing)

    async def complete_processing(self, transcription_id: UUID, language: str | None = None) -> None:
        transcription = await self._transcriptions.get_by_id(transcription_id)
        if transcription is None or transcription.status != TranscriptionStatus.PROCESSING:
            return

        processing = transcription
        try:
            file_path, file_name, audio_format, resolved_language = await self._resolve_audio_source(
                processing, language
            )
            text, model, duration, segments = await self._speech_to_text.transcribe_file(
                file_path=file_path,
                file_name=file_name,
                audio_format=audio_format,
                language=resolved_language or processing.language,
            )
        except TranscriptionProcessingError as exc:
            failed = replace(
                processing,
                status=TranscriptionStatus.FAILED,
                error_message=str(exc),
                updated_at=datetime.now(UTC),
            )
            await self._transcriptions.update(failed)
            return
        except Exception as exc:
            failed = replace(
                processing,
                status=TranscriptionStatus.FAILED,
                error_message=str(exc),
                updated_at=datetime.now(UTC),
            )
            await self._transcriptions.update(failed)
            return

        completed = replace(
            processing,
            transcript=text,
            status=TranscriptionStatus.COMPLETED,
            duration_seconds=duration or processing.duration_seconds,
            model_used=model,
            segments=segments,
            updated_at=datetime.now(UTC),
        )
        await self._transcriptions.update(completed)

    async def _resolve_transcription(self, data: StartTranscriptionInput) -> Transcription:
        if data.transcription_id:
            transcription = await self._transcriptions.get_by_id(data.transcription_id)
            if transcription is None:
                raise TranscriptionNotFoundError("Transcription not found.")
            return transcription

        if not data.recording_id:
            raise TranscriptionInvalidStateError("Either transcription_id or recording_id is required.")

        existing = await self._transcriptions.get_by_recording_id(data.recording_id)
        if existing and existing.status in {TranscriptionStatus.PENDING, TranscriptionStatus.PROCESSING, TranscriptionStatus.COMPLETED}:
            if existing.status == TranscriptionStatus.COMPLETED:
                return existing
            if existing.status == TranscriptionStatus.PROCESSING:
                return existing
            return existing

        recording = await self._recordings.get_completed_recording(data.recording_id)
        if recording is None:
            raise TranscriptionRecordingNotFoundError("Voice recording not found.")
        if recording.status != "completed" or not recording.storage_path:
            raise TranscriptionRecordingNotReadyError("Voice recording is not ready for transcription.")

        now = datetime.now(UTC)
        transcription = Transcription(
            id=uuid4(),
            recording_id=recording.id,
            consultation_id=recording.consultation_id,
            patient_id=recording.patient_id,
            doctor_id=recording.doctor_id,
            language=data.language,
            transcript=None,
            status=TranscriptionStatus.PENDING,
            duration_seconds=recording.duration_seconds,
            model_used=None,
            audio_storage_path=None,
            created_at=now,
            updated_at=now,
        )
        return await self._transcriptions.create(transcription)

    async def _resolve_audio_source(
        self,
        transcription: Transcription,
        language: str | None,
    ) -> tuple[str, str | None, str | None, str | None]:
        if transcription.recording_id:
            recording = await self._recordings.get_completed_recording(transcription.recording_id)
            if recording is None or not recording.storage_path:
                raise TranscriptionRecordingNotReadyError("Voice recording file is unavailable.")
            return (
                recording.storage_path,
                recording.file_name,
                recording.audio_format,
                language or transcription.language,
            )

        if transcription.audio_storage_path:
            return (
                transcription.audio_storage_path,
                None,
                "audio/webm",
                language or transcription.language,
            )

        raise TranscriptionRecordingNotReadyError("No audio source is available for this transcription.")
