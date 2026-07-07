from datetime import date, time

from app.modules.consultations.domain.entities.consultation import (
    Consultation,
    ConsultationStatus,
    VitalSigns,
)
from app.modules.appointments.infrastructure.models.appointment_model import AppointmentModel
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def _vital_signs_from_json(data: dict | None) -> VitalSigns | None:
    if not data:
        return None
    return VitalSigns(
        blood_pressure_systolic=data.get("blood_pressure_systolic"),
        blood_pressure_diastolic=data.get("blood_pressure_diastolic"),
        pulse=data.get("pulse"),
        temperature=data.get("temperature"),
        spo2=data.get("spo2"),
        respiratory_rate=data.get("respiratory_rate"),
        weight_kg=data.get("weight_kg"),
        height_cm=data.get("height_cm"),
    )


def _vital_signs_to_json(vital_signs: VitalSigns | None) -> dict | None:
    if vital_signs is None:
        return None
    return {
        "blood_pressure_systolic": vital_signs.blood_pressure_systolic,
        "blood_pressure_diastolic": vital_signs.blood_pressure_diastolic,
        "pulse": vital_signs.pulse,
        "temperature": vital_signs.temperature,
        "spo2": vital_signs.spo2,
        "respiratory_rate": vital_signs.respiratory_rate,
        "weight_kg": vital_signs.weight_kg,
        "height_cm": vital_signs.height_cm,
    }


def consultation_to_entity(
    model: ConsultationModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    appointment: AppointmentModel | None = None,
) -> Consultation:
    return Consultation(
        id=model.id,
        visit_number=model.visit_number,
        appointment_id=model.appointment_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        status=ConsultationStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        chief_complaint=model.chief_complaint,
        history_of_present_illness=model.history_of_present_illness,
        past_medical_history=model.past_medical_history,
        family_history=model.family_history,
        allergies=model.allergies,
        current_medications=model.current_medications,
        vital_signs=_vital_signs_from_json(model.vital_signs),
        physical_examination=model.physical_examination,
        diagnosis=model.diagnosis,
        assessment=model.assessment,
        treatment_plan=model.treatment_plan,
        doctor_notes=model.doctor_notes,
        follow_up_date=model.follow_up_date,
        deleted_at=model.deleted_at,
        patient_name=_patient_display_name(patient) if patient else None,
        patient_mrn=patient.mrn if patient else None,
        patient_uhid=patient.uhid if patient else None,
        patient_gender=patient.gender if patient else None,
        patient_date_of_birth=patient.date_of_birth if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
        appointment_number=appointment.appointment_number if appointment else None,
        appointment_date=appointment.appointment_date if appointment else None,
        appointment_time=appointment.appointment_time if appointment else None,
    )
