from uuid import UUID
from datetime import UTC, datetime
from uuid import uuid4

from app.modules.prescriptions.application.dto.prescription_dto import (
    CreatePrescriptionInput,
    PrescriptionItemInput,
)
from app.modules.prescriptions.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.prescriptions.domain.entities.prescription import Prescription, PrescriptionItem
from app.modules.prescriptions.domain.exceptions import PrescriptionConsultationNotFoundError
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.prescriptions.domain.value_objects import Duration


def _build_items(
    prescription_id: UUID, items: tuple[PrescriptionItemInput, ...]
) -> list[PrescriptionItem]:
    built: list[PrescriptionItem] = []
    for index, item in enumerate(items):
        built.append(
            PrescriptionItem(
                id=uuid4(),
                prescription_id=prescription_id,
                medicine_master_id=item.medicine_master_id,
                medicine_name=item.medicine_name,
                strength=item.strength,
                dosage=item.dosage,
                frequency=item.frequency,
                route=item.route,
                duration=Duration(item.duration) if item.duration else None,
                quantity=item.quantity,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
                dosage_instruction=item.dosage_instruction,
            )
        )
    return built


class CreatePrescriptionUseCase:
    def __init__(
        self,
        prescription_repository: PrescriptionRepository,
        consultation_lookup: ConsultationLookup,
    ) -> None:
        self._prescriptions = prescription_repository
        self._consultations = consultation_lookup

    async def execute(self, data: CreatePrescriptionInput) -> Prescription:
        context = await self._consultations.get_consultation_context(data.consultation_id)
        if context is None:
            raise PrescriptionConsultationNotFoundError("The selected consultation does not exist.")

        now = datetime.now(UTC)
        prescription_id = uuid4()
        prescription = Prescription(
            id=prescription_id,
            consultation_id=context.consultation_id,
            patient_id=context.patient_id,
            doctor_id=context.doctor_id,
            diagnosis=data.diagnosis,
            advice=data.advice,
            created_at=now,
            updated_at=now,
            items=_build_items(prescription_id, data.items),
        )
        return await self._prescriptions.create(prescription)
