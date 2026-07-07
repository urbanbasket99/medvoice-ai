from dataclasses import replace
from uuid import UUID

from app.modules.prescriptions.application.dto.prescription_dto import UpdatePrescriptionInput
from app.modules.prescriptions.application.use_cases.create_prescription import _build_items
from app.modules.prescriptions.domain.entities.prescription import Prescription
from app.modules.prescriptions.domain.exceptions import PrescriptionNotFoundError
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository


class UpdatePrescriptionUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, prescription_id: UUID, data: UpdatePrescriptionInput) -> Prescription:
        existing = await self._prescriptions.get_by_id(prescription_id)
        if existing is None:
            raise PrescriptionNotFoundError("Prescription not found.")

        updated = replace(
            existing,
            diagnosis=data.diagnosis,
            advice=data.advice,
            items=_build_items(prescription_id, data.items),
        )
        return await self._prescriptions.update(updated)
