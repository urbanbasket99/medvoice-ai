from uuid import UUID

from app.modules.prescriptions.application.dto.prescription_dto import (
    PrescriptionPrintItem,
    PrescriptionPrintOutput,
)
from app.modules.prescriptions.domain.exceptions import PrescriptionNotFoundError
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.prescriptions.domain.value_objects import DosageInstruction


def _format_dosage_summary(dosage: DosageInstruction | None) -> str | None:
    if dosage is None:
        return None
    parts: list[str] = []
    if dosage.morning:
        parts.append("Morning")
    if dosage.afternoon:
        parts.append("Afternoon")
    if dosage.night:
        parts.append("Night")
    if dosage.before_food:
        parts.append("Before food")
    if dosage.after_food:
        parts.append("After food")
    return ", ".join(parts) if parts else None


class GetPrescriptionPrintUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, prescription_id: UUID) -> PrescriptionPrintOutput:
        prescription = await self._prescriptions.get_by_id(prescription_id)
        if prescription is None:
            raise PrescriptionNotFoundError("Prescription not found.")

        items = [
            PrescriptionPrintItem(
                medicine_name=item.medicine_name,
                strength=item.strength,
                dosage=item.dosage,
                frequency=item.frequency.value,
                route=item.route.value,
                duration=item.duration.value if item.duration else None,
                quantity=item.quantity,
                instructions=item.instructions,
                dosage_summary=_format_dosage_summary(item.dosage_instruction),
            )
            for item in sorted(prescription.items or [], key=lambda row: row.sort_order)
        ]

        return PrescriptionPrintOutput(
            prescription_id=prescription.id,
            consultation_id=prescription.consultation_id,
            patient_name=prescription.patient_name,
            patient_mrn=prescription.patient_mrn,
            patient_uhid=prescription.patient_uhid,
            patient_gender=prescription.patient_gender,
            patient_date_of_birth=prescription.patient_date_of_birth,
            doctor_name=prescription.doctor_name,
            doctor_code=prescription.doctor_code,
            doctor_specialization=prescription.doctor_specialization,
            consultation_visit_number=prescription.consultation_visit_number,
            diagnosis=prescription.diagnosis,
            advice=prescription.advice,
            items=items,
            created_at=prescription.created_at,
        )
