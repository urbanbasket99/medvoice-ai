from uuid import UUID

from app.modules.doctors.domain.exceptions import DoctorNotFoundError
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository


class DeleteDoctorUseCase:
    """Soft-deletes a doctor (sets `deleted_at`); never a hard `DELETE`."""

    def __init__(self, doctor_repository: DoctorRepository) -> None:
        self._doctors = doctor_repository

    async def execute(self, doctor_id: UUID) -> None:
        deleted = await self._doctors.soft_delete(doctor_id)
        if not deleted:
            raise DoctorNotFoundError(f"Doctor {doctor_id} was not found.")
