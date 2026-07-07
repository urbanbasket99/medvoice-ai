from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.transcriptions.domain.entities.transcription import TranscriptSegment, Transcription
from app.modules.transcriptions.domain.value_objects import TranscriptionStatus
from app.modules.transcriptions.infrastructure.models.transcription_model import TranscriptionModel


def _segments_from_json(raw: list | None) -> tuple[TranscriptSegment, ...]:
    if not raw:
        return ()
    segments: list[TranscriptSegment] = []
    for index, item in enumerate(raw):
        if not isinstance(item, dict):
            continue
        segments.append(
            TranscriptSegment(
                index=int(item.get("index", index)),
                start_seconds=float(item.get("start_seconds") or 0),
                end_seconds=float(item.get("end_seconds") or 0),
                text=str(item.get("text") or ""),
                speaker_label=str(item.get("speaker_label") or "Speaker 1"),
                confidence=item.get("confidence"),
            )
        )
    return tuple(segments)


def _segments_to_json(segments: tuple[TranscriptSegment, ...]) -> list[dict]:
    return [
        {
            "index": segment.index,
            "start_seconds": segment.start_seconds,
            "end_seconds": segment.end_seconds,
            "text": segment.text,
            "speaker_label": segment.speaker_label,
            "confidence": segment.confidence,
        }
        for segment in segments
    ]


def transcription_to_entity(
    model: TranscriptionModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> Transcription:
    patient_name = None
    if patient:
        patient_name = " ".join(
            part for part in [patient.first_name, patient.middle_name, patient.last_name] if part
        ).strip()
    return Transcription(
        id=model.id,
        recording_id=model.recording_id,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        language=model.language,
        transcript=model.transcript,
        status=TranscriptionStatus(model.status),
        duration_seconds=model.duration_seconds,
        model_used=model.model_used,
        audio_storage_path=model.audio_storage_path,
        segments=_segments_from_json(model.segments),
        error_message=model.error_message,
        patient_name=patient_name or None,
        doctor_name=doctor.full_name if doctor else None,
        consultation_visit_number=consultation.visit_number if consultation else None,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def transcription_to_model(entity: Transcription) -> TranscriptionModel:
    return TranscriptionModel(
        id=entity.id,
        recording_id=entity.recording_id,
        consultation_id=entity.consultation_id,
        patient_id=entity.patient_id,
        doctor_id=entity.doctor_id,
        language=entity.language,
        transcript=entity.transcript,
        status=entity.status.value,
        duration_seconds=entity.duration_seconds,
        model_used=entity.model_used,
        audio_storage_path=entity.audio_storage_path,
        segments=_segments_to_json(entity.segments),
        error_message=entity.error_message,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )
