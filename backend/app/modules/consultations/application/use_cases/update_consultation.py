from dataclasses import replace

from uuid import UUID

from app.modules.consultations.application.dto.consultation_dto import UpdateConsultationInput
from app.modules.consultations.domain.exceptions import ConsultationNotFoundError
from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository


class UpdateConsultationUseCase:
    def __init__(self, consultation_repository: ConsultationRepository) -> None:
        self._consultations = consultation_repository

    async def execute(self, consultation_id: UUID, data: UpdateConsultationInput):
        existing = await self._consultations.get_by_id(consultation_id)
        if existing is None:
            raise ConsultationNotFoundError("Consultation not found.")

        updated = replace(
            existing,
            chief_complaint=data.chief_complaint,
            history_of_present_illness=data.history_of_present_illness,
            past_medical_history=data.past_medical_history,
            family_history=data.family_history,
            allergies=data.allergies,
            current_medications=data.current_medications,
            vital_signs=data.vital_signs,
            physical_examination=data.physical_examination,
            diagnosis=data.diagnosis,
            assessment=data.assessment,
            treatment_plan=data.treatment_plan,
            doctor_notes=data.doctor_notes,
            follow_up_date=data.follow_up_date,
            status=data.status,
        )
        return await self._consultations.update(updated)
