from datetime import UTC, datetime
from uuid import uuid4

from app.modules.appointments.application.dto.appointment_dto import CreateAppointmentInput
from app.modules.appointments.application.interfaces.appointment_number_generator import (
    AppointmentNumberGenerator,
)
from app.modules.appointments.domain.entities.appointment import Appointment, AppointmentStatus
from app.modules.appointments.domain.exceptions import (
    AppointmentDoctorNotFoundError,
    AppointmentPatientNotFoundError,
    AppointmentSlotConflictError,
)
from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository


class CreateAppointmentUseCase:
    def __init__(
        self,
        appointment_repository: AppointmentRepository,
        number_generator: AppointmentNumberGenerator,
    ) -> None:
        self._appointments = appointment_repository
        self._number_generator = number_generator

    async def execute(self, data: CreateAppointmentInput) -> Appointment:
        if not await self._appointments.patient_exists(data.patient_id):
            raise AppointmentPatientNotFoundError("The selected patient does not exist.")
        if not await self._appointments.doctor_exists(data.doctor_id):
            raise AppointmentDoctorNotFoundError("The selected doctor does not exist.")
        if await self._appointments.has_overlapping_slot(
            data.doctor_id,
            data.appointment_date,
            data.appointment_time,
            data.duration_minutes,
        ):
            raise AppointmentSlotConflictError(
                "The doctor already has an overlapping appointment at this time."
            )

        token_number = await self._appointments.next_token_number(
            data.doctor_id, data.appointment_date
        )
        appointment_number = await self._number_generator.generate()
        now = datetime.now(UTC)

        appointment = Appointment(
            id=uuid4(),
            appointment_number=appointment_number,
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            department=data.department,
            appointment_date=data.appointment_date,
            appointment_time=data.appointment_time,
            duration_minutes=data.duration_minutes,
            appointment_type=data.appointment_type,
            priority=data.priority,
            status=AppointmentStatus.SCHEDULED,
            created_at=now,
            updated_at=now,
            chief_complaint=data.chief_complaint,
            notes=data.notes,
            room=data.room,
            token_number=token_number,
        )
        return await self._appointments.create(appointment)
