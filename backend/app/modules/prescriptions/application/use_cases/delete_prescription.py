from uuid import UUID

from app.modules.prescriptions.domain.exceptions import PrescriptionNotFoundError
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository


class DeletePrescriptionUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, prescription_id: UUID) -> None:
        deleted = await self._prescriptions.soft_delete(prescription_id)
        if not deleted:
            raise PrescriptionNotFoundError("Prescription not found.")
