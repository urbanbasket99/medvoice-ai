from app.domain.exceptions import DomainError


class TranscriptionError(DomainError):
    """Base exception for the transcriptions bounded context."""


class TranscriptionNotFoundError(TranscriptionError):
    """Raised when a transcription cannot be found."""


class TranscriptionRecordingNotFoundError(TranscriptionError):
    """Raised when the linked voice recording does not exist."""


class TranscriptionRecordingNotReadyError(TranscriptionError):
    """Raised when the voice recording is not ready for transcription."""


class TranscriptionInvalidStateError(TranscriptionError):
    """Raised when a transcription action is invalid for the current status."""


class TranscriptionUploadError(TranscriptionError):
    """Raised when audio upload validation fails."""


class TranscriptionProcessingError(TranscriptionError):
    """Raised when speech-to-text processing fails."""


class TranscriptionConsultationNotFoundError(TranscriptionError):
    """Raised when the consultation context does not exist."""
