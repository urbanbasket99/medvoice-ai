from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.transcriptions.application.dto.transcription_dto import ConsultationContext, VoiceRecordingSnapshot
from app.modules.transcriptions.application.interfaces.voice_recording_lookup import VoiceRecordingLookup
from app.modules.voice.infrastructure.models.voice_recording_model import VoiceRecordingModel


class SqlAlchemyVoiceRecordingLookup(VoiceRecordingLookup):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_completed_recording(self, recording_id: UUID) -> VoiceRecordingSnapshot | None:
        result = await self._session.execute(
            select(VoiceRecordingModel).where(
                VoiceRecordingModel.id == recording_id,
                VoiceRecordingModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None or not model.storage_path or model.status != "completed":
            return None
        return VoiceRecordingSnapshot(
            id=model.id,
            consultation_id=model.consultation_id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
            storage_path=model.storage_path,
            file_name=model.file_name,
            audio_format=model.audio_format,
            duration_seconds=model.duration_seconds,
            status=model.status,
        )

    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationContext | None:
        result = await self._session.execute(
            select(ConsultationModel).where(
                ConsultationModel.id == consultation_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return ConsultationContext(
            consultation_id=model.id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
        )
