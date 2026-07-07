from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository
from app.modules.consultations.domain.value_objects import ConsultationListCriteria


class GetConsultationsUseCase:
    def __init__(self, consultation_repository: ConsultationRepository) -> None:
        self._consultations = consultation_repository

    async def execute(self, criteria: ConsultationListCriteria):
        return await self._consultations.list_consultations(criteria)
