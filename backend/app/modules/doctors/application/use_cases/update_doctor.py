from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from app.modules.doctors.application.dto.doctor_dto import UpdateDoctorInput
from app.modules.doctors.domain.entities.doctor import Doctor
from app.modules.doctors.domain.exceptions import (
    DoctorEmailAlreadyRegisteredError,
    DoctorMobileAlreadyRegisteredError,
    DoctorNotFoundError,
    DuplicateRegistrationNumberError,
)
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository


class UpdateDoctorUseCase:
    def __init__(self, doctor_repository: DoctorRepository) -> None:
        self._doctors = doctor_repository

    async def execute(self, doctor_id: UUID, data: UpdateDoctorInput) -> Doctor:
        existing = await self._doctors.get_by_id(doctor_id)
        if existing is None:
            raise DoctorNotFoundError(f"Doctor {doctor_id} was not found.")

        normalized_mobile = data.mobile.strip()
        if normalized_mobile != existing.mobile and await self._doctors.exists_by_mobile(
            normalized_mobile, exclude_id=doctor_id
        ):
            raise DoctorMobileAlreadyRegisteredError(
                f"A doctor with mobile number {normalized_mobile} is already registered."
            )

        normalized_email = data.email.strip().lower() if data.email else None
        if (
            normalized_email
            and normalized_email != existing.email
            and await self._doctors.exists_by_email(normalized_email, exclude_id=doctor_id)
        ):
            raise DoctorEmailAlreadyRegisteredError(
                f"A doctor with email {normalized_email} is already registered."
            )

        normalized_registration_number = data.registration_number.strip()
        if (
            normalized_registration_number != existing.registration_number
            and await self._doctors.exists_by_registration_number(
                normalized_registration_number, exclude_id=doctor_id
            )
        ):
            raise DuplicateRegistrationNumberError(
                f"A doctor with registration number {normalized_registration_number} already exists."
            )

        updated = replace(
            existing,
            full_name=data.full_name.strip(),
            gender=data.gender,
            date_of_birth=data.date_of_birth,
            department=data.department,
            specialization=data.specialization.strip(),
            qualification=data.qualification.strip(),
            registration_number=normalized_registration_number,
            experience_years=data.experience_years,
            mobile=normalized_mobile,
            status=data.status,
            joining_date=data.joining_date or existing.joining_date,
            email=normalized_email,
            address=data.address,
            languages_spoken=list(data.languages_spoken),
            consultation_fee=data.consultation_fee,
            working_hours=data.working_hours,
            photo_url=data.photo_url,
            updated_at=datetime.now(UTC),
        )
        return await self._doctors.update(updated)
