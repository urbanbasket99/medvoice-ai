from uuid import UUID

from app.modules.consultations.domain.exceptions import ConsultationNotFoundError
from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository


class GetConsultationUseCase:
    def __init__(self, consultation_repository: ConsultationRepository) -> None:
        self._consultations = consultation_repository

    async def execute(self, consultation_id: UUID):
        consultation = await self._consultations.get_by_id(consultation_id)
        if consultation is None:
            raise ConsultationNotFoundError("Consultation not found.")
        return consultation
