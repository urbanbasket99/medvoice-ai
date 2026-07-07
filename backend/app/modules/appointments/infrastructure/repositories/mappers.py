from app.modules.appointments.domain.entities.appointment import (
    Appointment,
    AppointmentPriority,
    AppointmentStatus,
    AppointmentType,
    Department,
)
from app.modules.appointments.infrastructure.models.appointment_model import AppointmentModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def appointment_to_entity(
    model: AppointmentModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
) -> Appointment:
    return Appointment(
        id=model.id,
        appointment_number=model.appointment_number,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        department=Department(model.department),
        appointment_date=model.appointment_date,
        appointment_time=model.appointment_time,
        duration_minutes=model.duration_minutes,
        appointment_type=AppointmentType(model.appointment_type),
        priority=AppointmentPriority(model.priority),
        status=AppointmentStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        chief_complaint=model.chief_complaint,
        notes=model.notes,
        room=model.room,
        token_number=model.token_number,
        deleted_at=model.deleted_at,
        patient_name=_patient_display_name(patient) if patient else None,
        patient_uhid=patient.uhid if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
    )
