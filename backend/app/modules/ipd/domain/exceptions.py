from app.domain.exceptions import DomainError


class WardNotFoundError(DomainError):
    pass


class BedNotFoundError(DomainError):
    pass


class AdmissionNotFoundError(DomainError):
    pass


class BedNotAvailableError(DomainError):
    pass


class PatientAlreadyAdmittedError(DomainError):
    pass


class WardCodeExistsError(DomainError):
    pass


class NursingNoteNotFoundError(DomainError):
    pass


class OtScheduleNotFoundError(DomainError):
    pass


class MlcCaseNotFoundError(DomainError):
    pass


class AdmissionChargeNotFoundError(DomainError):
    pass


class NoUnbilledChargesError(DomainError):
    pass


class ConsultationAlreadyAdmittedError(DomainError):
    pass
