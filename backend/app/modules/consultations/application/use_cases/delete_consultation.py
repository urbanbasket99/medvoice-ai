from uuid import UUID

from app.modules.consultations.domain.exceptions import ConsultationNotFoundError
from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository


class DeleteConsultationUseCase:
    def __init__(self, consultation_repository: ConsultationRepository) -> None:
        self._consultations = consultation_repository

    async def execute(self, consultation_id: UUID) -> None:
        deleted = await self._consultations.soft_delete(consultation_id)
        if not deleted:
            raise ConsultationNotFoundError("Consultation not found.")
