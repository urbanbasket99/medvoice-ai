from app.domain.exceptions import DomainError


class VoiceRecordingNotFoundError(DomainError):
    pass


class VoiceConsultationNotFoundError(DomainError):
    pass


class VoiceRecordingAlreadyActiveError(DomainError):
    pass


class VoiceRecordingInvalidStateError(DomainError):
    pass


class VoiceRecordingUploadError(DomainError):
    pass
