from datetime import UTC, datetime
from uuid import uuid4

from app.modules.transcriptions.application.dto.transcription_dto import UploadTranscriptionInput
from app.modules.transcriptions.application.interfaces.voice_recording_lookup import VoiceRecordingLookup
from app.modules.transcriptions.application.services.audio_storage_service import AudioStorageService
from app.modules.transcriptions.application.services.audio_upload_service import AudioUploadService
from app.modules.transcriptions.domain.entities.transcription import Transcription
from app.modules.transcriptions.domain.exceptions import TranscriptionConsultationNotFoundError
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository
from app.modules.transcriptions.domain.value_objects import TranscriptionStatus


class UploadTranscriptionUseCase:
    def __init__(
        self,
        repository: TranscriptionRepository,
        audio_upload_service: AudioUploadService,
        audio_storage_service: AudioStorageService,
        voice_recording_lookup: VoiceRecordingLookup,
    ) -> None:
        self._transcriptions = repository
        self._upload_validator = audio_upload_service
        self._storage = audio_storage_service
        self._recordings = voice_recording_lookup

    async def execute(self, data: UploadTranscriptionInput) -> Transcription:
        self._upload_validator.validate(data)

        if data.recording_id:
            recording = await self._recordings.get_completed_recording(data.recording_id)
            if recording is None:
                raise TranscriptionConsultationNotFoundError("Linked voice recording was not found or is not completed.")
            consultation_id = recording.consultation_id
            patient_id = recording.patient_id
            doctor_id = recording.doctor_id
            recording_id = recording.id
        else:
            context = await self._recordings.get_consultation_context(data.consultation_id)
            if context is None:
                raise TranscriptionConsultationNotFoundError("The selected consultation does not exist.")
            consultation_id = context.consultation_id
            patient_id = context.patient_id
            doctor_id = context.doctor_id
            recording_id = None

        now = datetime.now(UTC)
        transcription_id = uuid4()
        storage_path, _ = await self._storage.save(transcription_id, data.file_name, data.content)

        transcription = Transcription(
            id=transcription_id,
            recording_id=recording_id,
            consultation_id=consultation_id,
            patient_id=patient_id,
            doctor_id=doctor_id,
            language=data.language,
            transcript=None,
            status=TranscriptionStatus.PENDING,
            duration_seconds=None,
            model_used=None,
            audio_storage_path=storage_path,
            created_at=now,
            updated_at=now,
        )
        return await self._transcriptions.create(transcription)
