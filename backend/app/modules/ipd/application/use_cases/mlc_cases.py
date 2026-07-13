from datetime import UTC, datetime
from uuid import uuid4

from app.modules.ipd.application.dto.ipd_dto import UpsertMlcCaseInput
from app.modules.ipd.domain.entities.clinical import MlcCase
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository


class GetMlcCaseUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, admission_id) -> MlcCase | None:
        if not await self._clinical.admission_exists(admission_id):
            raise AdmissionNotFoundError("Admission not found.")
        return await self._clinical.get_mlc_case(admission_id)


class UpsertMlcCaseUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, data: UpsertMlcCaseInput) -> MlcCase:
        if not await self._clinical.admission_exists(data.admission_id):
            raise AdmissionNotFoundError("Admission not found.")

        existing = await self._clinical.get_mlc_case(data.admission_id)
        now = datetime.now(UTC)
        mlc_case = MlcCase(
            id=existing.id if existing else uuid4(),
            admission_id=data.admission_id,
            police_station=data.police_station,
            fir_number=data.fir_number,
            injury_details=data.injury_details,
            incident_datetime=data.incident_datetime,
            is_active=data.is_active,
            created_at=existing.created_at if existing else now,
            updated_at=now,
        )
        return await self._clinical.upsert_mlc_case(mlc_case)
