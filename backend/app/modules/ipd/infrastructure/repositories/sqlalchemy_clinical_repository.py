from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.infrastructure.models.user import UserModel
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.ipd.domain.entities.clinical import (
    AdmissionCharge,
    ConsultationAdmissionContext,
    MlcCase,
    NursingNote,
    OtSchedule,
)
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository
from app.modules.ipd.domain.value_objects import ChargeType, NursingNoteType, OtScheduleStatus
from app.modules.ipd.infrastructure.models.ipd_model import (
    IpdAdmissionModel,
    IpdChargeModel,
    IpdMlcCaseModel,
    IpdNursingNoteModel,
    IpdOtScheduleModel,
)


def _nursing_note_to_entity(model: IpdNursingNoteModel, user: UserModel | None = None) -> NursingNote:
    return NursingNote(
        id=model.id,
        admission_id=model.admission_id,
        note_type=NursingNoteType(model.note_type),
        content=model.content,
        recorded_at=model.recorded_at,
        recorded_by=model.recorded_by,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        recorded_by_name=user.full_name if user else None,
    )


def _ot_schedule_to_entity(model: IpdOtScheduleModel, surgeon: DoctorModel | None = None) -> OtSchedule:
    return OtSchedule(
        id=model.id,
        admission_id=model.admission_id,
        surgery_name=model.surgery_name,
        surgeon_id=model.surgeon_id,
        theatre=model.theatre,
        scheduled_at=model.scheduled_at,
        status=OtScheduleStatus(model.status),
        notes=model.notes,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        surgeon_name=surgeon.full_name if surgeon else None,
        surgeon_code=surgeon.doctor_code if surgeon else None,
    )


def _mlc_case_to_entity(model: IpdMlcCaseModel) -> MlcCase:
    return MlcCase(
        id=model.id,
        admission_id=model.admission_id,
        police_station=model.police_station,
        fir_number=model.fir_number,
        injury_details=model.injury_details,
        incident_datetime=model.incident_datetime,
        is_active=model.is_active,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _charge_to_entity(model: IpdChargeModel) -> AdmissionCharge:
    return AdmissionCharge(
        id=model.id,
        admission_id=model.admission_id,
        charge_type=ChargeType(model.charge_type),
        description=model.description,
        amount=model.amount,
        charge_date=model.charge_date,
        invoice_id=model.invoice_id,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyClinicalRepository(ClinicalRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def admission_exists(self, admission_id: UUID) -> bool:
        result = await self._session.execute(
            select(IpdAdmissionModel.id).where(
                IpdAdmissionModel.id == admission_id,
                IpdAdmissionModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_consultation_context(
        self, consultation_id: UUID
    ) -> ConsultationAdmissionContext | None:
        result = await self._session.execute(
            select(ConsultationModel).where(
                ConsultationModel.id == consultation_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return ConsultationAdmissionContext(
            consultation_id=model.id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
            chief_complaint=model.chief_complaint,
            diagnosis=model.diagnosis,
            notes=model.doctor_notes,
        )

    async def has_admission_for_consultation(self, consultation_id: UUID) -> bool:
        result = await self._session.execute(
            select(IpdAdmissionModel.id).where(
                IpdAdmissionModel.consultation_id == consultation_id,
                IpdAdmissionModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    async def list_nursing_notes(self, admission_id: UUID) -> list[NursingNote]:
        user = aliased(UserModel)
        result = await self._session.execute(
            select(IpdNursingNoteModel, user)
            .outerjoin(user, IpdNursingNoteModel.recorded_by == user.id)
            .where(
                IpdNursingNoteModel.admission_id == admission_id,
                IpdNursingNoteModel.deleted_at.is_(None),
            )
            .order_by(IpdNursingNoteModel.recorded_at.desc())
        )
        return [_nursing_note_to_entity(model, user_row) for model, user_row in result.all()]

    async def create_nursing_note(self, note: NursingNote) -> NursingNote:
        model = IpdNursingNoteModel(
            id=note.id,
            admission_id=note.admission_id,
            note_type=note.note_type.value,
            content=note.content,
            recorded_by=note.recorded_by,
            recorded_at=note.recorded_at,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_nursing_note(model.id)
        assert created is not None
        return created

    async def get_nursing_note(self, note_id: UUID) -> NursingNote | None:
        user = aliased(UserModel)
        result = await self._session.execute(
            select(IpdNursingNoteModel, user)
            .outerjoin(user, IpdNursingNoteModel.recorded_by == user.id)
            .where(
                IpdNursingNoteModel.id == note_id,
                IpdNursingNoteModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return _nursing_note_to_entity(row[0], row[1]) if row else None

    async def delete_nursing_note(self, note_id: UUID) -> None:
        await self._session.execute(
            update(IpdNursingNoteModel)
            .where(IpdNursingNoteModel.id == note_id, IpdNursingNoteModel.deleted_at.is_(None))
            .values(deleted_at=datetime.now(UTC))
        )

    async def list_ot_schedules(self, admission_id: UUID) -> list[OtSchedule]:
        surgeon = aliased(DoctorModel)
        result = await self._session.execute(
            select(IpdOtScheduleModel, surgeon)
            .join(surgeon, IpdOtScheduleModel.surgeon_id == surgeon.id)
            .where(
                IpdOtScheduleModel.admission_id == admission_id,
                IpdOtScheduleModel.deleted_at.is_(None),
            )
            .order_by(IpdOtScheduleModel.scheduled_at.asc())
        )
        return [_ot_schedule_to_entity(model, surgeon_row) for model, surgeon_row in result.all()]

    async def create_ot_schedule(self, schedule: OtSchedule) -> OtSchedule:
        model = IpdOtScheduleModel(
            id=schedule.id,
            admission_id=schedule.admission_id,
            surgery_name=schedule.surgery_name,
            surgeon_id=schedule.surgeon_id,
            theatre=schedule.theatre,
            scheduled_at=schedule.scheduled_at,
            status=schedule.status.value,
            notes=schedule.notes,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_ot_schedule(model.id)
        assert created is not None
        return created

    async def get_ot_schedule(self, schedule_id: UUID) -> OtSchedule | None:
        surgeon = aliased(DoctorModel)
        result = await self._session.execute(
            select(IpdOtScheduleModel, surgeon)
            .join(surgeon, IpdOtScheduleModel.surgeon_id == surgeon.id)
            .where(
                IpdOtScheduleModel.id == schedule_id,
                IpdOtScheduleModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return _ot_schedule_to_entity(row[0], row[1]) if row else None

    async def update_ot_schedule(self, schedule: OtSchedule) -> OtSchedule:
        await self._session.execute(
            update(IpdOtScheduleModel)
            .where(IpdOtScheduleModel.id == schedule.id)
            .values(
                surgery_name=schedule.surgery_name,
                surgeon_id=schedule.surgeon_id,
                theatre=schedule.theatre,
                scheduled_at=schedule.scheduled_at,
                status=schedule.status.value,
                notes=schedule.notes,
                updated_at=schedule.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_ot_schedule(schedule.id)
        assert updated is not None
        return updated

    async def get_mlc_case(self, admission_id: UUID) -> MlcCase | None:
        result = await self._session.execute(
            select(IpdMlcCaseModel).where(IpdMlcCaseModel.admission_id == admission_id)
        )
        model = result.scalar_one_or_none()
        return _mlc_case_to_entity(model) if model else None

    async def upsert_mlc_case(self, mlc_case: MlcCase) -> MlcCase:
        existing = await self._session.execute(
            select(IpdMlcCaseModel).where(IpdMlcCaseModel.admission_id == mlc_case.admission_id)
        )
        model = existing.scalar_one_or_none()
        if model is None:
            model = IpdMlcCaseModel(
                id=mlc_case.id,
                admission_id=mlc_case.admission_id,
                police_station=mlc_case.police_station,
                fir_number=mlc_case.fir_number,
                injury_details=mlc_case.injury_details,
                incident_datetime=mlc_case.incident_datetime,
                is_active=mlc_case.is_active,
            )
            self._session.add(model)
        else:
            model.police_station = mlc_case.police_station
            model.fir_number = mlc_case.fir_number
            model.injury_details = mlc_case.injury_details
            model.incident_datetime = mlc_case.incident_datetime
            model.is_active = mlc_case.is_active
            model.updated_at = mlc_case.updated_at
        await self._session.flush()
        saved = await self.get_mlc_case(mlc_case.admission_id)
        assert saved is not None
        return saved

    async def list_charges(self, admission_id: UUID) -> list[AdmissionCharge]:
        result = await self._session.execute(
            select(IpdChargeModel)
            .where(IpdChargeModel.admission_id == admission_id)
            .order_by(IpdChargeModel.charge_date.desc(), IpdChargeModel.created_at.desc())
        )
        return [_charge_to_entity(model) for model in result.scalars().all()]

    async def create_charge(self, charge: AdmissionCharge) -> AdmissionCharge:
        model = IpdChargeModel(
            id=charge.id,
            admission_id=charge.admission_id,
            charge_type=charge.charge_type.value,
            description=charge.description,
            amount=charge.amount,
            charge_date=charge.charge_date,
            invoice_id=charge.invoice_id,
        )
        self._session.add(model)
        await self._session.flush()
        return _charge_to_entity(model)

    async def list_unbilled_charges(self, admission_id: UUID) -> list[AdmissionCharge]:
        result = await self._session.execute(
            select(IpdChargeModel).where(
                IpdChargeModel.admission_id == admission_id,
                IpdChargeModel.invoice_id.is_(None),
            )
        )
        return [_charge_to_entity(model) for model in result.scalars().all()]

    async def mark_charges_invoiced(self, charge_ids: list[UUID], invoice_id: UUID) -> None:
        if not charge_ids:
            return
        await self._session.execute(
            update(IpdChargeModel)
            .where(IpdChargeModel.id.in_(charge_ids))
            .values(invoice_id=invoice_id, updated_at=datetime.now(UTC))
        )

    async def surgeon_exists(self, surgeon_id: UUID) -> bool:
        result = await self._session.execute(
            select(DoctorModel.id).where(
                DoctorModel.id == surgeon_id,
                DoctorModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None
