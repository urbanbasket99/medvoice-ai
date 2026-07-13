from app.domain.exceptions import DomainError


class CertificateNotFoundError(DomainError):
    pass


class CertificatePatientNotFoundError(DomainError):
    pass


class CertificateDoctorNotFoundError(DomainError):
    pass
