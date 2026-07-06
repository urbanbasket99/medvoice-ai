from uuid import UUID

from app.modules.patients.domain.entities.patient import Patient
from app.modules.patients.domain.exceptions import PatientNotFoundError
from app.modules.patients.domain.repositories.patient_repository import PatientRepository


class GetPatientUseCase:
    def __init__(self, patient_repository: PatientRepository) -> None:
        self._patients = patient_repository

    async def execute(self, patient_id: UUID) -> Patient:
        patient = await self._patients.get_by_id(patient_id)
        if patient is None:
            raise PatientNotFoundError(f"Patient {patient_id} was not found.")
        return patient
