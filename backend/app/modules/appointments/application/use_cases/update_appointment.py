from dataclasses import replace
from uuid import UUID

from app.modules.appointments.application.dto.appointment_dto import UpdateAppointmentInput
from app.modules.appointments.domain.exceptions import (
    AppointmentDoctorNotFoundError,
    AppointmentNotFoundError,
    AppointmentPatientNotFoundError,
    AppointmentSlotConflictError,
)
from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository


class UpdateAppointmentUseCase:
    def __init__(self, appointment_repository: AppointmentRepository) -> None:
        self._appointments = appointment_repository

    async def execute(self, appointment_id: UUID, data: UpdateAppointmentInput):
        existing = await self._appointments.get_by_id(appointment_id)
        if existing is None:
            raise AppointmentNotFoundError(f"Appointment {appointment_id} not found.")
        if not await self._appointments.patient_exists(data.patient_id):
            raise AppointmentPatientNotFoundError("The selected patient does not exist.")
        if not await self._appointments.doctor_exists(data.doctor_id):
            raise AppointmentDoctorNotFoundError("The selected doctor does not exist.")
        if await self._appointments.has_overlapping_slot(
            data.doctor_id,
            data.appointment_date,
            data.appointment_time,
            data.duration_minutes,
            exclude_id=appointment_id,
        ):
            raise AppointmentSlotConflictError(
                "The doctor already has an overlapping appointment at this time."
            )

        updated = replace(
            existing,
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            department=data.department,
            appointment_date=data.appointment_date,
            appointment_time=data.appointment_time,
            duration_minutes=data.duration_minutes,
            appointment_type=data.appointment_type,
            priority=data.priority,
            status=data.status,
            chief_complaint=data.chief_complaint,
            notes=data.notes,
            room=data.room,
        )
        return await self._appointments.update(updated)
