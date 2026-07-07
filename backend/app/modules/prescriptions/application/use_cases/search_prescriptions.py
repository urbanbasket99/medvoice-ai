from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.prescriptions.domain.value_objects import PrescriptionPage


class SearchPrescriptionsUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, query: str, page: int, page_size: int) -> PrescriptionPage:
        return await self._prescriptions.search_prescriptions(query, page, page_size)
