from datetime import UTC, datetime
from uuid import UUID

from app.modules.consultations.domain.exceptions import ConsultationNotFoundError
from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.ipd.application.dto.ipd_dto import UpdateAdmissionInput
from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError, BedNotAvailableError, BedNotFoundError
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.repositories.bed_repository import BedRepository
from app.modules.ipd.domain.value_objects import AdmissionStatus, BedStatus


class UpdateAdmissionUseCase:
    def __init__(
        self,
        admission_repository: AdmissionRepository,
        bed_repository: BedRepository,
    ) -> None:
        self._admissions = admission_repository
        self._beds = bed_repository

    async def execute(self, admission_id: UUID, data: UpdateAdmissionInput) -> Admission:
        admission = await self._admissions.get_by_id(admission_id)
        if admission is None:
            raise AdmissionNotFoundError("Admission not found.")

        if admission.status != AdmissionStatus.ADMITTED:
            raise AdmissionNotFoundError("Only admitted records can be updated.")

        if not await self._admissions.doctor_exists(data.admitting_doctor_id):
            raise DoctorNotFoundError("The selected doctor does not exist.")

        if data.consultation_id and not await self._admissions.consultation_matches_patient(
            data.consultation_id, admission.patient_id
        ):
            raise ConsultationNotFoundError("Consultation not found for selected patient.")

        if admission.bed_id != data.bed_id:
            if admission.bed_id is not None:
                previous_bed = await self._beds.get_by_id(admission.bed_id)
                if previous_bed is not None:
                    previous_bed.status = BedStatus.AVAILABLE
                    previous_bed.updated_at = datetime.now(UTC)
                    await self._beds.update(previous_bed)

            if data.bed_id is not None:
                new_bed = await self._beds.get_by_id(data.bed_id)
                if new_bed is None:
                    raise BedNotFoundError("Bed not found.")
                if new_bed.status != BedStatus.AVAILABLE:
                    raise BedNotAvailableError("Selected bed is not available.")
                new_bed.status = BedStatus.OCCUPIED
                new_bed.updated_at = datetime.now(UTC)
                await self._beds.update(new_bed)

        admission.consultation_id = data.consultation_id
        admission.admitting_doctor_id = data.admitting_doctor_id
        admission.bed_id = data.bed_id
        admission.admission_date = data.admission_date
        admission.expected_discharge_date = data.expected_discharge_date
        admission.admission_type = data.admission_type
        admission.chief_complaint = data.chief_complaint
        admission.diagnosis = data.diagnosis
        admission.notes = data.notes
        admission.updated_at = datetime.now(UTC)
        return await self._admissions.update(admission)
