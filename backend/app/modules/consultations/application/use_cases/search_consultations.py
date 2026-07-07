from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository


class SearchConsultationsUseCase:
    def __init__(self, consultation_repository: ConsultationRepository) -> None:
        self._consultations = consultation_repository

    async def execute(self, query: str, page: int, page_size: int):
        return await self._consultations.search_consultations(query, page, page_size)
