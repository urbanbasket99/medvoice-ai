from app.modules.patients.domain.entities.patient import Patient
from app.modules.patients.domain.exceptions import PatientNotFoundError
from app.modules.patients.domain.repositories.patient_repository import PatientRepository


class GetPatientByIdentifierUseCase:
    """Lookup a patient by UHID or MRN."""

    def __init__(self, patient_repository: PatientRepository) -> None:
        self._patients = patient_repository

    async def execute(self, *, uhid: str | None = None, mrn: str | None = None) -> Patient:
        if uhid:
            patient = await self._patients.get_by_uhid(uhid.strip())
        elif mrn:
            patient = await self._patients.get_by_mrn(mrn.strip())
        else:
            raise PatientNotFoundError("Patient was not found.")

        if patient is None:
            raise PatientNotFoundError("Patient was not found.")
        return patient
