from datetime import UTC, datetime
from uuid import uuid4

from app.modules.ipd.application.dto.ipd_dto import CreateAdmissionInput
from app.modules.ipd.application.interfaces.admission_number_generator import (
    AdmissionNumberGenerator,
)
from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.exceptions import (
    BedNotAvailableError,
    BedNotFoundError,
    PatientAlreadyAdmittedError,
)
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.repositories.bed_repository import BedRepository
from app.modules.ipd.domain.value_objects import AdmissionStatus, BedStatus
from app.modules.patients.domain.exceptions import PatientNotFoundError
from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.consultations.domain.exceptions import ConsultationNotFoundError


class CreateAdmissionUseCase:
    def __init__(
        self,
        admission_repository: AdmissionRepository,
        bed_repository: BedRepository,
        number_generator: AdmissionNumberGenerator,
    ) -> None:
        self._admissions = admission_repository
        self._beds = bed_repository
        self._numbers = number_generator

    async def execute(self, data: CreateAdmissionInput) -> Admission:
        if not await self._admissions.patient_exists(data.patient_id):
            raise PatientNotFoundError("The selected patient does not exist.")
        if not await self._admissions.doctor_exists(data.admitting_doctor_id):
            raise DoctorNotFoundError("The selected doctor does not exist.")
        if await self._admissions.has_active_admission(data.patient_id):
            raise PatientAlreadyAdmittedError("Patient already has an active admission.")

        if data.consultation_id and not await self._admissions.consultation_matches_patient(
            data.consultation_id, data.patient_id
        ):
            raise ConsultationNotFoundError("Consultation not found for selected patient.")

        if data.bed_id is not None:
            bed = await self._beds.get_by_id(data.bed_id)
            if bed is None:
                raise BedNotFoundError("Bed not found.")
            if bed.status != BedStatus.AVAILABLE:
                raise BedNotAvailableError("Selected bed is not available.")
            bed.status = BedStatus.OCCUPIED
            bed.updated_at = datetime.now(UTC)
            await self._beds.update(bed)

        now = datetime.now(UTC)
        admission = Admission(
            id=uuid4(),
            admission_number=await self._numbers.generate(),
            patient_id=data.patient_id,
            consultation_id=data.consultation_id,
            admitting_doctor_id=data.admitting_doctor_id,
            bed_id=data.bed_id,
            admission_date=data.admission_date,
            expected_discharge_date=data.expected_discharge_date,
            admission_type=data.admission_type,
            status=AdmissionStatus.ADMITTED,
            chief_complaint=data.chief_complaint,
            diagnosis=data.diagnosis,
            notes=data.notes,
            created_at=now,
            updated_at=now,
        )
        return await self._admissions.create(admission)
