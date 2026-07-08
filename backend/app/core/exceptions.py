"""Maps domain exceptions to HTTP responses.

This is the only place in the codebase that should know both about
`app.domain.exceptions` and about HTTP status codes — it is the seam
between the framework-agnostic domain layer and the FastAPI presentation
layer.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    DomainError,
    EmailAlreadyRegisteredError,
    InvalidAccessTokenError,
    InvalidCredentialsError,
    InvalidCurrentPasswordError,
    InvalidRefreshTokenError,
    PermissionDeniedError,
    RefreshTokenExpiredError,
    RefreshTokenReusedError,
    UserInactiveError,
    UserNotFoundError,
)
from app.modules.doctors.domain.exceptions import (
    DoctorEmailAlreadyRegisteredError,
    DoctorMobileAlreadyRegisteredError,
    DoctorNotFoundError,
    DuplicateRegistrationNumberError,
)
from app.modules.appointments.domain.exceptions import (
    AppointmentDoctorNotFoundError,
    AppointmentNotFoundError,
    AppointmentPatientNotFoundError,
    AppointmentSlotConflictError,
)
from app.modules.consultations.domain.exceptions import (
    ConsultationAppointmentAlreadyLinkedError,
    ConsultationAppointmentNotFoundError,
    ConsultationNotFoundError,
)
from app.modules.voice.domain.exceptions import (
    VoiceConsultationNotFoundError,
    VoiceRecordingAlreadyActiveError,
    VoiceRecordingInvalidStateError,
    VoiceRecordingNotFoundError,
    VoiceRecordingUploadError,
)
from app.modules.ai.domain.exceptions import (
    AICapabilityNotSupportedError,
    AIProviderConfigurationError,
    AIProviderHealthCheckError,
    AIProviderNotAvailableError,
    AIProviderNotFoundError,
    AIProviderRequestError,
)
from app.modules.transcriptions.domain.exceptions import (
    TranscriptionConsultationNotFoundError,
    TranscriptionInvalidStateError,
    TranscriptionNotFoundError,
    TranscriptionProcessingError,
    TranscriptionRecordingNotFoundError,
    TranscriptionRecordingNotReadyError,
    TranscriptionUploadError,
)
from app.modules.patients.domain.exceptions import (
    DuplicateEmailError,
    DuplicateMobileNumberError,
    PatientNotFoundError,
)
from app.modules.prescriptions.domain.exceptions import (
    MedicineNotFoundError,
    PrescriptionConsultationNotFoundError,
    PrescriptionNotFoundError,
)
from app.modules.laboratory.domain.exceptions import (
    LabOrderConsultationNotFoundError,
    LabOrderInvalidStatusTransitionError,
    LabOrderNotFoundError,
    LabTestNotFoundError,
)
from app.modules.radiology.domain.exceptions import (
    RadiologyOrderConsultationNotFoundError,
    RadiologyOrderInvalidStatusTransitionError,
    RadiologyOrderNotFoundError,
    RadiologyTestNotFoundError,
)
from app.modules.pharmacy.domain.exceptions import (
    DispenseInvalidStatusTransitionError,
    DispenseRecordNotFoundError,
    InsufficientStockError,
    PharmacyBatchNotFoundError,
    PharmacyMedicineCodeAlreadyExistsError,
    PharmacyMedicineNotFoundError,
    PharmacyStockNotFoundError,
)
from app.modules.billing.domain.exceptions import (
    InvoiceConsultationNotFoundError,
    InvoiceNotFoundError,
    InvalidInvoiceStatusError,
    PaymentExceedsBalanceError,
    PaymentNotFoundError,
)
from app.modules.notifications.domain.exceptions import (
    NotificationNotFoundError,
    NotificationPreferenceNotFoundError,
)
from app.modules.audit.domain.exceptions import AuditLogNotFoundError

_STATUS_BY_ERROR: dict[type[DomainError], int] = {
    InvalidCredentialsError: status.HTTP_401_UNAUTHORIZED,
    UserInactiveError: status.HTTP_403_FORBIDDEN,
    UserNotFoundError: status.HTTP_404_NOT_FOUND,
    EmailAlreadyRegisteredError: status.HTTP_409_CONFLICT,
    InvalidAccessTokenError: status.HTTP_401_UNAUTHORIZED,
    InvalidRefreshTokenError: status.HTTP_401_UNAUTHORIZED,
    RefreshTokenExpiredError: status.HTTP_401_UNAUTHORIZED,
    RefreshTokenReusedError: status.HTTP_401_UNAUTHORIZED,
    InvalidCurrentPasswordError: status.HTTP_400_BAD_REQUEST,
    PermissionDeniedError: status.HTTP_403_FORBIDDEN,
    PatientNotFoundError: status.HTTP_404_NOT_FOUND,
    DuplicateMobileNumberError: status.HTTP_409_CONFLICT,
    DuplicateEmailError: status.HTTP_409_CONFLICT,
    DoctorNotFoundError: status.HTTP_404_NOT_FOUND,
    DoctorMobileAlreadyRegisteredError: status.HTTP_409_CONFLICT,
    DoctorEmailAlreadyRegisteredError: status.HTTP_409_CONFLICT,
    DuplicateRegistrationNumberError: status.HTTP_409_CONFLICT,
    AppointmentNotFoundError: status.HTTP_404_NOT_FOUND,
    AppointmentPatientNotFoundError: status.HTTP_404_NOT_FOUND,
    AppointmentDoctorNotFoundError: status.HTTP_404_NOT_FOUND,
    AppointmentSlotConflictError: status.HTTP_409_CONFLICT,
    ConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    ConsultationAppointmentNotFoundError: status.HTTP_404_NOT_FOUND,
    ConsultationAppointmentAlreadyLinkedError: status.HTTP_409_CONFLICT,
    VoiceRecordingNotFoundError: status.HTTP_404_NOT_FOUND,
    VoiceConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    VoiceRecordingAlreadyActiveError: status.HTTP_409_CONFLICT,
    VoiceRecordingInvalidStateError: status.HTTP_409_CONFLICT,
    VoiceRecordingUploadError: status.HTTP_400_BAD_REQUEST,
    AIProviderNotFoundError: status.HTTP_404_NOT_FOUND,
    AIProviderNotAvailableError: status.HTTP_503_SERVICE_UNAVAILABLE,
    AIProviderConfigurationError: status.HTTP_503_SERVICE_UNAVAILABLE,
    AIProviderHealthCheckError: status.HTTP_503_SERVICE_UNAVAILABLE,
    AIProviderRequestError: status.HTTP_502_BAD_GATEWAY,
    AICapabilityNotSupportedError: status.HTTP_501_NOT_IMPLEMENTED,
    TranscriptionNotFoundError: status.HTTP_404_NOT_FOUND,
    TranscriptionRecordingNotFoundError: status.HTTP_404_NOT_FOUND,
    TranscriptionConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    TranscriptionRecordingNotReadyError: status.HTTP_409_CONFLICT,
    TranscriptionInvalidStateError: status.HTTP_409_CONFLICT,
    TranscriptionUploadError: status.HTTP_400_BAD_REQUEST,
    TranscriptionProcessingError: status.HTTP_502_BAD_GATEWAY,
    PrescriptionNotFoundError: status.HTTP_404_NOT_FOUND,
    PrescriptionConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    MedicineNotFoundError: status.HTTP_404_NOT_FOUND,
    LabOrderNotFoundError: status.HTTP_404_NOT_FOUND,
    LabOrderConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    LabTestNotFoundError: status.HTTP_404_NOT_FOUND,
    LabOrderInvalidStatusTransitionError: status.HTTP_409_CONFLICT,
    RadiologyOrderNotFoundError: status.HTTP_404_NOT_FOUND,
    RadiologyOrderConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    RadiologyTestNotFoundError: status.HTTP_404_NOT_FOUND,
    RadiologyOrderInvalidStatusTransitionError: status.HTTP_409_CONFLICT,
    PharmacyMedicineNotFoundError: status.HTTP_404_NOT_FOUND,
    PharmacyMedicineCodeAlreadyExistsError: status.HTTP_409_CONFLICT,
    PharmacyBatchNotFoundError: status.HTTP_404_NOT_FOUND,
    PharmacyStockNotFoundError: status.HTTP_404_NOT_FOUND,
    InsufficientStockError: status.HTTP_409_CONFLICT,
    DispenseRecordNotFoundError: status.HTTP_404_NOT_FOUND,
    DispenseInvalidStatusTransitionError: status.HTTP_409_CONFLICT,
    InvoiceNotFoundError: status.HTTP_404_NOT_FOUND,
    InvoiceConsultationNotFoundError: status.HTTP_404_NOT_FOUND,
    PaymentNotFoundError: status.HTTP_404_NOT_FOUND,
    InvalidInvoiceStatusError: status.HTTP_409_CONFLICT,
    PaymentExceedsBalanceError: status.HTTP_409_CONFLICT,
    NotificationNotFoundError: status.HTTP_404_NOT_FOUND,
    NotificationPreferenceNotFoundError: status.HTTP_404_NOT_FOUND,
    AuditLogNotFoundError: status.HTTP_404_NOT_FOUND,
}

_DEFAULT_MESSAGE_BY_ERROR: dict[type[DomainError], str] = {
    InvalidCredentialsError: "Invalid email or password.",
    UserInactiveError: "This account has been deactivated.",
    UserNotFoundError: "User not found.",
    EmailAlreadyRegisteredError: "An account with this email already exists.",
    InvalidAccessTokenError: "Invalid or expired access token.",
    InvalidRefreshTokenError: "Invalid or unrecognized refresh token.",
    RefreshTokenExpiredError: "Session expired. Please sign in again.",
    RefreshTokenReusedError: "Session revoked for security reasons. Please sign in again.",
    InvalidCurrentPasswordError: "Current password is incorrect.",
    PermissionDeniedError: "You do not have permission to perform this action.",
    PatientNotFoundError: "Patient not found.",
    DuplicateMobileNumberError: "A patient with this mobile number is already registered.",
    DuplicateEmailError: "A patient with this email is already registered.",
    DoctorNotFoundError: "Doctor not found.",
    DoctorMobileAlreadyRegisteredError: "A doctor with this mobile number is already registered.",
    DoctorEmailAlreadyRegisteredError: "A doctor with this email is already registered.",
    DuplicateRegistrationNumberError: "A doctor with this registration number already exists.",
    AppointmentNotFoundError: "Appointment not found.",
    AppointmentPatientNotFoundError: "The selected patient does not exist.",
    AppointmentDoctorNotFoundError: "The selected doctor does not exist.",
    AppointmentSlotConflictError: "The doctor already has an overlapping appointment at this time.",
    ConsultationNotFoundError: "Consultation not found.",
    ConsultationAppointmentNotFoundError: "The selected appointment does not exist.",
    ConsultationAppointmentAlreadyLinkedError: "A consultation already exists for this appointment.",
    VoiceRecordingNotFoundError: "Voice recording not found.",
    VoiceConsultationNotFoundError: "Consultation not found.",
    VoiceRecordingAlreadyActiveError: "A recording is already in progress for this consultation.",
    VoiceRecordingInvalidStateError: "Recording is not in a valid state for this action.",
    VoiceRecordingUploadError: "Failed to upload voice recording.",
    AIProviderNotFoundError: "AI provider not found.",
    AIProviderNotAvailableError: "The selected AI provider is not available yet.",
    AIProviderConfigurationError: "AI provider is not configured.",
    AIProviderHealthCheckError: "AI provider health check failed.",
    AIProviderRequestError: "The AI provider request failed.",
    AICapabilityNotSupportedError: "This AI capability is not enabled in the current release.",
    TranscriptionNotFoundError: "Transcription not found.",
    TranscriptionRecordingNotFoundError: "Voice recording not found.",
    TranscriptionConsultationNotFoundError: "Consultation not found.",
    TranscriptionRecordingNotReadyError: "Voice recording is not ready for transcription.",
    TranscriptionInvalidStateError: "Transcription is not in a valid state for this action.",
    TranscriptionUploadError: "Audio upload failed.",
    TranscriptionProcessingError: "Speech-to-text processing failed.",
    PrescriptionNotFoundError: "Prescription not found.",
    PrescriptionConsultationNotFoundError: "Consultation not found.",
    MedicineNotFoundError: "Medicine not found.",
    LabOrderNotFoundError: "Lab order not found.",
    LabOrderConsultationNotFoundError: "Consultation not found.",
    LabTestNotFoundError: "Lab test not found.",
    LabOrderInvalidStatusTransitionError: "Invalid lab order status transition.",
    RadiologyOrderNotFoundError: "Radiology order not found.",
    RadiologyOrderConsultationNotFoundError: "Consultation not found.",
    RadiologyTestNotFoundError: "Radiology test not found.",
    RadiologyOrderInvalidStatusTransitionError: "Invalid radiology order status transition.",
    PharmacyMedicineNotFoundError: "Pharmacy medicine not found.",
    PharmacyMedicineCodeAlreadyExistsError: "A medicine with this code already exists.",
    PharmacyBatchNotFoundError: "Pharmacy batch not found.",
    PharmacyStockNotFoundError: "Stock record not found.",
    InsufficientStockError: "Insufficient stock for this operation.",
    DispenseRecordNotFoundError: "Dispense record not found.",
    DispenseInvalidStatusTransitionError: "Invalid dispense status transition.",
    InvoiceNotFoundError: "Invoice not found.",
    InvoiceConsultationNotFoundError: "The selected consultation does not exist.",
    PaymentNotFoundError: "Payment not found.",
    InvalidInvoiceStatusError: "Invalid invoice status transition.",
    PaymentExceedsBalanceError: "Payment amount exceeds the outstanding balance.",
    NotificationNotFoundError: "Notification not found.",
    NotificationPreferenceNotFoundError: "Notification preferences not found.",
    AuditLogNotFoundError: "Audit log entry not found.",
}


def _resolve_status(error: DomainError) -> int:
    for error_type, http_status in _STATUS_BY_ERROR.items():
        if isinstance(error, error_type):
            return http_status
    return status.HTTP_400_BAD_REQUEST


def _resolve_message(error: DomainError) -> str:
    for error_type, message in _DEFAULT_MESSAGE_BY_ERROR.items():
        if isinstance(error, error_type):
            return str(error) or message
    return str(error) or "An unexpected error occurred."


async def _domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(
        status_code=_resolve_status(exc),
        content={"detail": _resolve_message(exc), "error_type": type(exc).__name__},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI application."""
    app.add_exception_handler(DomainError, _domain_error_handler)
