from uuid import UUID

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.voice.domain.entities.voice_recording import RecordingStatus, VoiceRecording
from app.modules.voice.domain.repositories.voice_recording_repository import (
    ConsultationVoiceContext,
    VoiceRecordingRepository,
)
from app.modules.voice.domain.value_objects import SortDirection, VoiceRecordingListCriteria, VoiceRecordingPage
from app.modules.voice.infrastructure.models.voice_recording_model import VoiceRecordingModel
from app.modules.voice.infrastructure.repositories.mappers import voice_recording_to_entity

_SORT_COLUMNS = {
    "created_at": VoiceRecordingModel.created_at,
    "duration_seconds": VoiceRecordingModel.duration_seconds,
    "file_size_bytes": VoiceRecordingModel.file_size_bytes,
}

_ACTIVE_STATUSES = {RecordingStatus.RECORDING.value, RecordingStatus.STOPPED.value}


class SqlAlchemyVoiceRecordingRepository(VoiceRecordingRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(VoiceRecordingModel, patient, doctor, consultation)
            .join(patient, VoiceRecordingModel.patient_id == patient.id)
            .join(doctor, VoiceRecordingModel.doctor_id == doctor.id)
            .join(consultation, VoiceRecordingModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> VoiceRecording:
        model, patient, doctor, consultation = row
        return voice_recording_to_entity(model, patient, doctor, consultation)

    async def get_by_id(self, recording_id: UUID) -> VoiceRecording | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                VoiceRecordingModel.id == recording_id,
                VoiceRecordingModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationVoiceContext | None:
        result = await self._session.execute(
            select(ConsultationModel).where(
                ConsultationModel.id == consultation_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return ConsultationVoiceContext(
            id=model.id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
            visit_number=model.visit_number,
        )

    async def has_active_recording(self, consultation_id: UUID) -> bool:
        result = await self._session.execute(
            select(VoiceRecordingModel.id).where(
                VoiceRecordingModel.consultation_id == consultation_id,
                VoiceRecordingModel.deleted_at.is_(None),
                VoiceRecordingModel.status.in_(_ACTIVE_STATUSES),
            )
        )
        return result.scalar_one_or_none() is not None

    async def create(self, recording: VoiceRecording) -> VoiceRecording:
        model = VoiceRecordingModel(
            id=recording.id,
            consultation_id=recording.consultation_id,
            patient_id=recording.patient_id,
            doctor_id=recording.doctor_id,
            file_name=recording.file_name,
            storage_path=recording.storage_path,
            duration_seconds=recording.duration_seconds,
            file_size_bytes=recording.file_size_bytes,
            audio_format=recording.audio_format,
            status=recording.status.value,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, recording: VoiceRecording) -> VoiceRecording:
        await self._session.execute(
            update(VoiceRecordingModel)
            .where(VoiceRecordingModel.id == recording.id)
            .values(
                file_name=recording.file_name,
                storage_path=recording.storage_path,
                duration_seconds=recording.duration_seconds,
                file_size_bytes=recording.file_size_bytes,
                audio_format=recording.audio_format,
                status=recording.status.value,
            )
        )
        updated = await self.get_by_id(recording.id)
        assert updated is not None
        return updated

    async def soft_delete(self, recording_id: UUID) -> bool:
        result = await self._session.execute(
            update(VoiceRecordingModel)
            .where(VoiceRecordingModel.id == recording_id, VoiceRecordingModel.deleted_at.is_(None))
            .values(deleted_at=func.now(), status=RecordingStatus.CANCELLED.value)
        )
        return (result.rowcount or 0) > 0

    async def list_recordings(self, criteria: VoiceRecordingListCriteria) -> VoiceRecordingPage:
        stmt, _, _, _ = self._base_select()
        conditions = [VoiceRecordingModel.deleted_at.is_(None)]

        if criteria.consultation_id is not None:
            conditions.append(VoiceRecordingModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id is not None:
            conditions.append(VoiceRecordingModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(VoiceRecordingModel.doctor_id == criteria.doctor_id)
        if criteria.status is not None:
            conditions.append(VoiceRecordingModel.status == criteria.status.value)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, VoiceRecordingModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(VoiceRecordingModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return VoiceRecordingPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)
