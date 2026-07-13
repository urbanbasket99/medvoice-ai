from datetime import UTC, datetime
from uuid import UUID

from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.repositories.bed_repository import BedRepository
from app.modules.ipd.domain.value_objects import AdmissionStatus, BedStatus


class CancelAdmissionUseCase:
    def __init__(
        self,
        admission_repository: AdmissionRepository,
        bed_repository: BedRepository,
    ) -> None:
        self._admissions = admission_repository
        self._beds = bed_repository

    async def execute(self, admission_id: UUID) -> Admission:
        admission = await self._admissions.get_by_id(admission_id)
        if admission is None:
            raise AdmissionNotFoundError("Admission not found.")
        if admission.status != AdmissionStatus.ADMITTED:
            raise AdmissionNotFoundError("Only admitted records can be cancelled.")

        now = datetime.now(UTC)
        admission.status = AdmissionStatus.CANCELLED
        admission.updated_at = now

        if admission.bed_id is not None:
            bed = await self._beds.get_by_id(admission.bed_id)
            if bed is not None:
                bed.status = BedStatus.AVAILABLE
                bed.updated_at = now
                await self._beds.update(bed)

        return await self._admissions.update(admission)
