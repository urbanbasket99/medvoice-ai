from app.core.config import get_settings
from app.modules.transcriptions.application.dto.transcription_dto import UploadTranscriptionInput
from app.modules.transcriptions.domain.exceptions import TranscriptionUploadError


class AudioUploadService:
    """Validates direct audio uploads before storage/transcription."""

    def validate(self, data: UploadTranscriptionInput) -> None:
        settings = get_settings()
        max_bytes = settings.max_transcription_upload_mb * 1024 * 1024
        if len(data.content) == 0:
            raise TranscriptionUploadError("Uploaded audio file is empty.")
        if len(data.content) > max_bytes:
            raise TranscriptionUploadError(
                f"Uploaded audio exceeds maximum size of {settings.max_transcription_upload_mb} MB."
            )
        allowed_prefixes = ("audio/", "video/webm", "application/octet-stream")
        content_type = (data.content_type or "").lower()
        if content_type and not any(content_type.startswith(prefix) for prefix in allowed_prefixes):
            raise TranscriptionUploadError("Unsupported audio content type.")
