from uuid import UUID

from app.modules.appointments.domain.entities.appointment import Appointment
from app.modules.appointments.domain.exceptions import AppointmentNotFoundError
from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository


class GetAppointmentUseCase:
    def __init__(self, appointment_repository: AppointmentRepository) -> None:
        self._appointments = appointment_repository

    async def execute(self, appointment_id: UUID) -> Appointment:
        appointment = await self._appointments.get_by_id(appointment_id)
        if appointment is None:
            raise AppointmentNotFoundError(f"Appointment {appointment_id} not found.")
        return appointment
