from app.domain.exceptions import DomainError


class PharmacyMedicineNotFoundError(DomainError):
    pass


class PharmacyMedicineCodeAlreadyExistsError(DomainError):
    pass


class PharmacyBatchNotFoundError(DomainError):
    pass


class PharmacyStockNotFoundError(DomainError):
    pass


class InsufficientStockError(DomainError):
    pass


class DispenseRecordNotFoundError(DomainError):
    pass


class DispenseInvalidStatusTransitionError(DomainError):
    pass


class PharmacySupplierNotFoundError(DomainError):
    pass


class PharmacySupplierCodeAlreadyExistsError(DomainError):
    pass
