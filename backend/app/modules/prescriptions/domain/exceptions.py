from app.domain.exceptions import DomainError


class PrescriptionNotFoundError(DomainError):
    pass


class PrescriptionConsultationNotFoundError(DomainError):
    pass


class MedicineNotFoundError(DomainError):
    pass
