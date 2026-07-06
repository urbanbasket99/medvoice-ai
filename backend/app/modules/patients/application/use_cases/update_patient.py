from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from app.modules.patients.application.dto.patient_dto import UpdatePatientInput
from app.modules.patients.domain.entities.patient import Patient
from app.modules.patients.domain.exceptions import (
    DuplicateEmailError,
    DuplicateMobileNumberError,
    PatientNotFoundError,
)
from app.modules.patients.domain.repositories.patient_repository import PatientRepository


class UpdatePatientUseCase:
    def __init__(self, patient_repository: PatientRepository) -> None:
        self._patients = patient_repository

    async def execute(self, patient_id: UUID, data: UpdatePatientInput) -> Patient:
        existing = await self._patients.get_by_id(patient_id)
        if existing is None:
            raise PatientNotFoundError(f"Patient {patient_id} was not found.")

        normalized_mobile = data.mobile.strip()
        if normalized_mobile != existing.mobile and await self._patients.exists_by_mobile(
            normalized_mobile, exclude_id=patient_id
        ):
            raise DuplicateMobileNumberError(
                f"A patient with mobile number {normalized_mobile} is already registered."
            )

        normalized_email = data.email.strip().lower() if data.email else None
        if (
            normalized_email
            and normalized_email != existing.email
            and await self._patients.exists_by_email(normalized_email, exclude_id=patient_id)
        ):
            raise DuplicateEmailError(f"A patient with email {normalized_email} is already registered.")

        updated = replace(
            existing,
            first_name=data.first_name.strip(),
            middle_name=data.middle_name.strip() if data.middle_name else None,
            last_name=data.last_name.strip(),
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            mobile=normalized_mobile,
            status=data.status,
            registration_date=data.registration_date or existing.registration_date,
            blood_group=data.blood_group,
            marital_status=data.marital_status,
            occupation=data.occupation,
            alternate_mobile=data.alternate_mobile,
            email=normalized_email,
            address_line1=data.address_line1,
            address_line2=data.address_line2,
            city=data.city,
            state=data.state,
            country=data.country,
            postal_code=data.postal_code,
            emergency_name=data.emergency_name,
            emergency_relation=data.emergency_relation,
            emergency_mobile=data.emergency_mobile,
            insurance_provider=data.insurance_provider,
            insurance_number=data.insurance_number,
            allergies=data.allergies,
            chronic_conditions=data.chronic_conditions,
            notes=data.notes,
            updated_by=data.updated_by,
            updated_at=datetime.now(UTC),
        )
        return await self._patients.update(updated)
