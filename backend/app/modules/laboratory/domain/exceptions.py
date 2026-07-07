from app.domain.exceptions import DomainError


class LabOrderNotFoundError(DomainError):
    pass


class LabOrderConsultationNotFoundError(DomainError):
    pass


class LabTestNotFoundError(DomainError):
    pass


class LabOrderInvalidStatusTransitionError(DomainError):
    pass
