from uuid import UUID

from app.modules.appointments.domain.exceptions import AppointmentNotFoundError
from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository


class DeleteAppointmentUseCase:
    def __init__(self, appointment_repository: AppointmentRepository) -> None:
        self._appointments = appointment_repository

    async def execute(self, appointment_id: UUID) -> None:
        deleted = await self._appointments.soft_delete(appointment_id)
        if not deleted:
            raise AppointmentNotFoundError(f"Appointment {appointment_id} not found.")
