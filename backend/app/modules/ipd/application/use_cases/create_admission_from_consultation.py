from datetime import UTC, datetime
from uuid import uuid4

from app.modules.consultations.domain.exceptions import ConsultationNotFoundError
from app.modules.ipd.application.dto.ipd_dto import CreateAdmissionFromConsultationInput, CreateAdmissionInput
from app.modules.ipd.application.interfaces.admission_number_generator import AdmissionNumberGenerator
from app.modules.ipd.application.use_cases.create_admission import CreateAdmissionUseCase
from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.exceptions import (
    ConsultationAlreadyAdmittedError,
    PatientAlreadyAdmittedError,
)
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository
from app.modules.ipd.domain.value_objects import AdmissionType


class CreateAdmissionFromConsultationUseCase:
    def __init__(
        self,
        clinical_repository: ClinicalRepository,
        create_admission_use_case: CreateAdmissionUseCase,
    ) -> None:
        self._clinical = clinical_repository
        self._create_admission = create_admission_use_case

    async def execute(self, data: CreateAdmissionFromConsultationInput) -> Admission:
        context = await self._clinical.get_consultation_context(data.consultation_id)
        if context is None:
            raise ConsultationNotFoundError("Consultation not found.")

        if await self._clinical.has_admission_for_consultation(data.consultation_id):
            raise ConsultationAlreadyAdmittedError("This consultation already has an admission.")

        admission_input = CreateAdmissionInput(
            patient_id=context.patient_id,
            admitting_doctor_id=context.doctor_id,
            admission_date=data.admission_date,
            admission_type=AdmissionType.TRANSFER,
            consultation_id=context.consultation_id,
            bed_id=data.bed_id,
            expected_discharge_date=data.expected_discharge_date,
            chief_complaint=context.chief_complaint,
            diagnosis=context.diagnosis,
            notes=data.notes or context.notes,
        )
        try:
            return await self._create_admission.execute(admission_input)
        except PatientAlreadyAdmittedError:
            raise
