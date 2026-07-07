from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository
from app.modules.appointments.domain.value_objects import AppointmentPage


class SearchAppointmentsUseCase:
    def __init__(self, appointment_repository: AppointmentRepository) -> None:
        self._appointments = appointment_repository

    async def execute(self, query: str, page: int, page_size: int) -> AppointmentPage:
        return await self._appointments.search_appointments(query, page, page_size)
