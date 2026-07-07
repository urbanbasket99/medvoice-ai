from app.domain.exceptions import DomainError


class ConsultationNotFoundError(DomainError):
    pass


class ConsultationAppointmentNotFoundError(DomainError):
    pass


class ConsultationAppointmentAlreadyLinkedError(DomainError):
    pass


class ConsultationPatientNotFoundError(DomainError):
    pass


class ConsultationDoctorNotFoundError(DomainError):
    pass
