from datetime import UTC, datetime
from uuid import uuid4

from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.ipd.application.dto.ipd_dto import CreateOtScheduleInput, UpdateOtScheduleInput
from app.modules.ipd.domain.entities.clinical import OtSchedule
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError, OtScheduleNotFoundError
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository


class CreateOtScheduleUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, data: CreateOtScheduleInput) -> OtSchedule:
        if not await self._clinical.admission_exists(data.admission_id):
            raise AdmissionNotFoundError("Admission not found.")
        if not await self._clinical.surgeon_exists(data.surgeon_id):
            raise DoctorNotFoundError("Surgeon not found.")

        now = datetime.now(UTC)
        schedule = OtSchedule(
            id=uuid4(),
            admission_id=data.admission_id,
            surgery_name=data.surgery_name,
            surgeon_id=data.surgeon_id,
            theatre=data.theatre,
            scheduled_at=data.scheduled_at,
            status=data.status,
            notes=data.notes,
            created_at=now,
            updated_at=now,
        )
        return await self._clinical.create_ot_schedule(schedule)


class ListOtSchedulesUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, admission_id) -> list[OtSchedule]:
        if not await self._clinical.admission_exists(admission_id):
            raise AdmissionNotFoundError("Admission not found.")
        return await self._clinical.list_ot_schedules(admission_id)


class UpdateOtScheduleUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, schedule_id, data: UpdateOtScheduleInput) -> OtSchedule:
        schedule = await self._clinical.get_ot_schedule(schedule_id)
        if schedule is None:
            raise OtScheduleNotFoundError("OT schedule not found.")
        if not await self._clinical.surgeon_exists(data.surgeon_id):
            raise DoctorNotFoundError("Surgeon not found.")

        schedule.surgery_name = data.surgery_name
        schedule.surgeon_id = data.surgeon_id
        schedule.theatre = data.theatre
        schedule.scheduled_at = data.scheduled_at
        schedule.status = data.status
        schedule.notes = data.notes
        schedule.updated_at = datetime.now(UTC)
        return await self._clinical.update_ot_schedule(schedule)
