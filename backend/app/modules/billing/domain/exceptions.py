from app.domain.exceptions import DomainError


class InvoiceNotFoundError(DomainError):
    pass


class PaymentNotFoundError(DomainError):
    pass


class InvoiceConsultationNotFoundError(DomainError):
    pass


class InvalidInvoiceStatusError(DomainError):
    pass


class PaymentExceedsBalanceError(DomainError):
    pass


class TpaNotFoundError(DomainError):
    pass


class TpaCodeAlreadyExistsError(DomainError):
    pass


class InsuranceClaimNotFoundError(DomainError):
    pass
