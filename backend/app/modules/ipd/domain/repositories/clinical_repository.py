from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.ipd.domain.entities.clinical import (
    AdmissionCharge,
    ConsultationAdmissionContext,
    MlcCase,
    NursingNote,
    OtSchedule,
)


class ClinicalRepository(ABC):
    @abstractmethod
    async def admission_exists(self, admission_id: UUID) -> bool: ...

    @abstractmethod
    async def get_consultation_context(
        self, consultation_id: UUID
    ) -> ConsultationAdmissionContext | None: ...

    @abstractmethod
    async def has_admission_for_consultation(self, consultation_id: UUID) -> bool: ...

    @abstractmethod
    async def list_nursing_notes(self, admission_id: UUID) -> list[NursingNote]: ...

    @abstractmethod
    async def create_nursing_note(self, note: NursingNote) -> NursingNote: ...

    @abstractmethod
    async def delete_nursing_note(self, note_id: UUID) -> None: ...

    @abstractmethod
    async def get_nursing_note(self, note_id: UUID) -> NursingNote | None: ...

    @abstractmethod
    async def list_ot_schedules(self, admission_id: UUID) -> list[OtSchedule]: ...

    @abstractmethod
    async def create_ot_schedule(self, schedule: OtSchedule) -> OtSchedule: ...

    @abstractmethod
    async def update_ot_schedule(self, schedule: OtSchedule) -> OtSchedule: ...

    @abstractmethod
    async def get_ot_schedule(self, schedule_id: UUID) -> OtSchedule | None: ...

    @abstractmethod
    async def get_mlc_case(self, admission_id: UUID) -> MlcCase | None: ...

    @abstractmethod
    async def upsert_mlc_case(self, mlc_case: MlcCase) -> MlcCase: ...

    @abstractmethod
    async def list_charges(self, admission_id: UUID) -> list[AdmissionCharge]: ...

    @abstractmethod
    async def create_charge(self, charge: AdmissionCharge) -> AdmissionCharge: ...

    @abstractmethod
    async def list_unbilled_charges(self, admission_id: UUID) -> list[AdmissionCharge]: ...

    @abstractmethod
    async def mark_charges_invoiced(self, charge_ids: list[UUID], invoice_id: UUID) -> None: ...

    @abstractmethod
    async def surgeon_exists(self, surgeon_id: UUID) -> bool: ...
