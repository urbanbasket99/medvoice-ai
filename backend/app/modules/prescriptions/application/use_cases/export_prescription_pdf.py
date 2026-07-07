from uuid import UUID

from app.modules.prescriptions.application.dto.prescription_dto import PrescriptionPdfExportOutput
from app.modules.prescriptions.domain.exceptions import PrescriptionNotFoundError
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository


class ExportPrescriptionPdfUseCase:
    def __init__(self, prescription_repository: PrescriptionRepository) -> None:
        self._prescriptions = prescription_repository

    async def execute(self, prescription_id: UUID) -> PrescriptionPdfExportOutput:
        prescription = await self._prescriptions.get_by_id(prescription_id)
        if prescription is None:
            raise PrescriptionNotFoundError("Prescription not found.")

        return PrescriptionPdfExportOutput(
            pdf_placeholder=True,
            message="PDF export is not yet implemented. Use the print preview endpoint.",
            prescription_id=prescription_id,
        )
