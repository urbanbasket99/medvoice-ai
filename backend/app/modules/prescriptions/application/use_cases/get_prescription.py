from uuid import UUID

from app.modules.prescriptions.domain.entities.prescription import Prescription
from app.modules.prescriptions.domain.exceptions import PrescriptionNotFoundError
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository


class GetPrescriptionUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, prescription_id: UUID) -> Prescription:
        prescription = await self._prescriptions.get_by_id(prescription_id)
        if prescription is None:
            raise PrescriptionNotFoundError("Prescription not found.")
        return prescription
