from datetime import UTC, datetime
from uuid import uuid4

from app.modules.consultations.application.dto.consultation_dto import CreateConsultationInput
from app.modules.consultations.application.interfaces.visit_number_generator import VisitNumberGenerator
from app.modules.consultations.domain.entities.consultation import Consultation, ConsultationStatus
from app.modules.consultations.domain.exceptions import (
    ConsultationAppointmentAlreadyLinkedError,
    ConsultationAppointmentNotFoundError,
)
from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository


class CreateConsultationUseCase:
    def __init__(
        self,
        consultation_repository: ConsultationRepository,
        visit_number_generator: VisitNumberGenerator,
    ) -> None:
        self._consultations = consultation_repository
        self._visit_number_generator = visit_number_generator

    async def execute(self, data: CreateConsultationInput) -> Consultation:
        snapshot = await self._consultations.get_appointment_snapshot(data.appointment_id)
        if snapshot is None:
            raise ConsultationAppointmentNotFoundError("The selected appointment does not exist.")

        existing = await self._consultations.get_by_appointment_id(data.appointment_id)
        if existing is not None and not existing.is_deleted:
            raise ConsultationAppointmentAlreadyLinkedError(
                "A consultation already exists for this appointment."
            )

        patient_allergies = await self._consultations.get_patient_allergies(snapshot.patient_id)
        now = datetime.now(UTC)
        visit_number = await self._visit_number_generator.generate()

        consultation = Consultation(
            id=uuid4(),
            visit_number=visit_number,
            appointment_id=snapshot.id,
            patient_id=snapshot.patient_id,
            doctor_id=snapshot.doctor_id,
            status=ConsultationStatus.IN_PROGRESS,
            created_at=now,
            updated_at=now,
            chief_complaint=snapshot.chief_complaint,
            allergies=patient_allergies,
        )
        return await self._consultations.create(consultation)
