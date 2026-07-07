from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.voice.domain.entities.voice_recording import RecordingStatus, VoiceRecording
from app.modules.voice.infrastructure.models.voice_recording_model import VoiceRecordingModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def voice_recording_to_entity(
    model: VoiceRecordingModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> VoiceRecording:
    return VoiceRecording(
        id=model.id,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        file_name=model.file_name,
        storage_path=model.storage_path,
        duration_seconds=model.duration_seconds,
        file_size_bytes=model.file_size_bytes,
        audio_format=model.audio_format,
        status=RecordingStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        patient_name=_patient_display_name(patient) if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        consultation_visit_number=consultation.visit_number if consultation else None,
    )
