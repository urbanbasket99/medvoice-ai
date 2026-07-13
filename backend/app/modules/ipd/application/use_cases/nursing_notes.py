from datetime import UTC, datetime
from uuid import uuid4

from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.ipd.application.dto.ipd_dto import CreateNursingNoteInput
from app.modules.ipd.domain.entities.clinical import NursingNote
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository


class CreateNursingNoteUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, data: CreateNursingNoteInput) -> NursingNote:
        if not await self._clinical.admission_exists(data.admission_id):
            raise AdmissionNotFoundError("Admission not found.")

        now = datetime.now(UTC)
        note = NursingNote(
            id=uuid4(),
            admission_id=data.admission_id,
            note_type=data.note_type,
            content=data.content,
            recorded_at=data.recorded_at,
            recorded_by=data.recorded_by,
            created_at=now,
            updated_at=now,
        )
        return await self._clinical.create_nursing_note(note)


class ListNursingNotesUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, admission_id) -> list[NursingNote]:
        if not await self._clinical.admission_exists(admission_id):
            raise AdmissionNotFoundError("Admission not found.")
        return await self._clinical.list_nursing_notes(admission_id)


class DeleteNursingNoteUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, note_id) -> None:
        note = await self._clinical.get_nursing_note(note_id)
        if note is None:
            from app.modules.ipd.domain.exceptions import NursingNoteNotFoundError

            raise NursingNoteNotFoundError("Nursing note not found.")
        await self._clinical.delete_nursing_note(note_id)
