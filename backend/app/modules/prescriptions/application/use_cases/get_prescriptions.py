from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.prescriptions.domain.value_objects import PrescriptionListCriteria, PrescriptionPage


class GetPrescriptionsUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, criteria: PrescriptionListCriteria) -> PrescriptionPage:
        return await self._prescriptions.list_prescriptions(criteria)
