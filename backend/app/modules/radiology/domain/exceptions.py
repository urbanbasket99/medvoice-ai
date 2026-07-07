from app.domain.exceptions import DomainError


class RadiologyOrderNotFoundError(DomainError):
    pass


class RadiologyOrderConsultationNotFoundError(DomainError):
    pass


class RadiologyTestNotFoundError(DomainError):
    pass


class RadiologyOrderInvalidStatusTransitionError(DomainError):
    pass
