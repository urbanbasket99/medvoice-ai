from uuid import UUID

from app.modules.patients.domain.exceptions import PatientNotFoundError
from app.modules.patients.domain.repositories.patient_repository import PatientRepository


class DeletePatientUseCase:
    """Soft-deletes a patient (sets `deleted_at`); never a hard `DELETE`."""

    def __init__(self, patient_repository: PatientRepository) -> None:
        self._patients = patient_repository

    async def execute(self, patient_id: UUID) -> None:
        deleted = await self._patients.soft_delete(patient_id)
        if not deleted:
            raise PatientNotFoundError(f"Patient {patient_id} was not found.")
