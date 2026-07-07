from datetime import UTC, date, datetime
from uuid import uuid4

from app.modules.doctors.application.dto.doctor_dto import CreateDoctorInput
from app.modules.doctors.application.interfaces.doctor_code_generator import DoctorCodeGenerator
from app.modules.doctors.domain.entities.doctor import Doctor, DoctorStatus
from app.modules.doctors.domain.exceptions import (
    DoctorEmailAlreadyRegisteredError,
    DoctorMobileAlreadyRegisteredError,
    DuplicateRegistrationNumberError,
)
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository


class CreateDoctorUseCase:
    def __init__(
        self, doctor_repository: DoctorRepository, code_generator: DoctorCodeGenerator
    ) -> None:
        self._doctors = doctor_repository
        self._code_generator = code_generator

    async def execute(self, data: CreateDoctorInput) -> Doctor:
        if await self._doctors.exists_by_mobile(data.mobile):
            raise DoctorMobileAlreadyRegisteredError(
                f"A doctor with mobile number {data.mobile} is already registered."
            )
        if data.email and await self._doctors.exists_by_email(data.email):
            raise DoctorEmailAlreadyRegisteredError(
                f"A doctor with email {data.email} is already registered."
            )
        if await self._doctors.exists_by_registration_number(data.registration_number):
            raise DuplicateRegistrationNumberError(
                f"A doctor with registration number {data.registration_number} already exists."
            )

        doctor_code = await self._code_generator.generate()
        now = datetime.now(UTC)
        doctor = Doctor(
            id=uuid4(),
            doctor_code=doctor_code,
            full_name=data.full_name.strip(),
            gender=data.gender,
            date_of_birth=data.date_of_birth,
            department=data.department,
            specialization=data.specialization.strip(),
            qualification=data.qualification.strip(),
            registration_number=data.registration_number.strip(),
            experience_years=data.experience_years,
            mobile=data.mobile.strip(),
            joining_date=data.joining_date or date.today(),
            status=DoctorStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            email=data.email.strip().lower() if data.email else None,
            address=data.address,
            languages_spoken=list(data.languages_spoken),
            consultation_fee=data.consultation_fee,
            working_hours=data.working_hours,
            photo_url=data.photo_url,
        )
        return await self._doctors.create(doctor)
