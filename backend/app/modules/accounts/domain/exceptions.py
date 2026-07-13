from app.domain.exceptions import DomainError


class AccountNotFoundError(DomainError):
    pass


class AccountCodeExistsError(DomainError):
    pass


class VendorNotFoundError(DomainError):
    pass


class VendorCodeExistsError(DomainError):
    pass


class VendorBillNotFoundError(DomainError):
    pass


class UnbalancedJournalError(DomainError):
    pass


class PaymentExceedsBillBalanceError(DomainError):
    pass
