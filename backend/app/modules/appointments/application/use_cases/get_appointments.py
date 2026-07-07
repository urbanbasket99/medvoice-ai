from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository
from app.modules.appointments.domain.value_objects import AppointmentListCriteria, AppointmentPage


class GetAppointmentsUseCase:
    def __init__(self, appointment_repository: AppointmentRepository) -> None:
        self._appointments = appointment_repository

    async def execute(self, criteria: AppointmentListCriteria) -> AppointmentPage:
        return await self._appointments.list_appointments(criteria)
