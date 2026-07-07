from pathlib import Path
from uuid import UUID

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.transcriptions.domain.entities.transcription import Transcription, TranscriptionListCriteria, TranscriptionPage
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository
from app.modules.transcriptions.infrastructure.models.transcription_model import TranscriptionModel
from app.modules.transcriptions.infrastructure.repositories.mappers import transcription_to_entity, transcription_to_model

_SORT_COLUMNS = {
    "created_at": TranscriptionModel.created_at,
    "status": TranscriptionModel.status,
}


class SqlAlchemyTranscriptionRepository(TranscriptionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(TranscriptionModel, patient, doctor, consultation)
            .join(patient, TranscriptionModel.patient_id == patient.id)
            .join(doctor, TranscriptionModel.doctor_id == doctor.id)
            .join(consultation, TranscriptionModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> Transcription:
        model, patient, doctor, consultation = row
        return transcription_to_entity(model, patient, doctor, consultation)

    async def create(self, transcription: Transcription) -> Transcription:
        model = transcription_to_model(transcription)
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(transcription.id)
        assert created is not None
        return created

    async def update(self, transcription: Transcription) -> Transcription:
        await self._session.execute(
            update(TranscriptionModel)
            .where(TranscriptionModel.id == transcription.id)
            .values(
                language=transcription.language,
                transcript=transcription.transcript,
                status=transcription.status.value,
                duration_seconds=transcription.duration_seconds,
                model_used=transcription.model_used,
                audio_storage_path=transcription.audio_storage_path,
                segments=[
                    {
                        "index": segment.index,
                        "start_seconds": segment.start_seconds,
                        "end_seconds": segment.end_seconds,
                        "text": segment.text,
                        "speaker_label": segment.speaker_label,
                        "confidence": segment.confidence,
                    }
                    for segment in transcription.segments
                ],
                error_message=transcription.error_message,
                updated_at=transcription.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(transcription.id)
        assert updated is not None
        return updated

    async def get_by_id(self, transcription_id: UUID) -> Transcription | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                TranscriptionModel.id == transcription_id,
                TranscriptionModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def get_by_recording_id(self, recording_id: UUID) -> Transcription | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                TranscriptionModel.recording_id == recording_id,
                TranscriptionModel.deleted_at.is_(None),
            ).order_by(TranscriptionModel.created_at.desc())
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def list(self, criteria: TranscriptionListCriteria) -> TranscriptionPage:
        stmt, _, _, _ = self._base_select()
        filters = [TranscriptionModel.deleted_at.is_(None)]
        if criteria.consultation_id:
            filters.append(TranscriptionModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id:
            filters.append(TranscriptionModel.patient_id == criteria.patient_id)
        if criteria.doctor_id:
            filters.append(TranscriptionModel.doctor_id == criteria.doctor_id)
        if criteria.status:
            filters.append(TranscriptionModel.status == criteria.status.value)

        filtered = stmt.where(and_(*filters))
        count_stmt = select(func.count()).select_from(filtered.subquery())
        total = int((await self._session.execute(count_stmt)).scalar_one())

        sort_column = _SORT_COLUMNS.get(criteria.sort_by, TranscriptionModel.created_at)
        ordered = filtered.order_by(
            sort_column.asc() if criteria.sort_dir == "asc" else sort_column.desc()
        )
        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(ordered.offset(offset).limit(criteria.page_size))
        items = [self._map_row(row) for row in result.all()]
        total_pages = max(1, (total + criteria.page_size - 1) // criteria.page_size)
        return TranscriptionPage(
            items=items,
            total=total,
            page=criteria.page,
            page_size=criteria.page_size,
            total_pages=total_pages,
        )

    async def soft_delete(self, transcription_id: UUID) -> None:
        await self._session.execute(
            update(TranscriptionModel)
            .where(TranscriptionModel.id == transcription_id)
            .values(deleted_at=func.now())
        )
