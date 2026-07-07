from app.domain.exceptions import DomainError


class AppointmentNotFoundError(DomainError):
    pass


class AppointmentPatientNotFoundError(DomainError):
    pass


class AppointmentDoctorNotFoundError(DomainError):
    pass


class AppointmentSlotConflictError(DomainError):
    pass
