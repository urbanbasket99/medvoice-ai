from app.domain.exceptions import DomainError


class NotificationNotFoundError(DomainError):
    pass


class NotificationPreferenceNotFoundError(DomainError):
    pass
