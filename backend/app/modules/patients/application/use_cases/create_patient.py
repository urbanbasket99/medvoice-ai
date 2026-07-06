from datetime import UTC, date, datetime
from uuid import uuid4

from app.modules.patients.application.dto.patient_dto import CreatePatientInput
from app.modules.patients.application.interfaces.mrn_generator import MrnGenerator
from app.modules.patients.application.interfaces.uhid_generator import UhidGenerator
from app.modules.patients.domain.entities.patient import Patient, PatientStatus
from app.modules.patients.domain.exceptions import DuplicateEmailError, DuplicateMobileNumberError
from app.modules.patients.domain.repositories.patient_repository import PatientRepository


class CreatePatientUseCase:
    def __init__(
        self,
        patient_repository: PatientRepository,
        uhid_generator: UhidGenerator,
        mrn_generator: MrnGenerator,
    ) -> None:
        self._patients = patient_repository
        self._uhid_generator = uhid_generator
        self._mrn_generator = mrn_generator

    async def execute(self, data: CreatePatientInput) -> Patient:
        if await self._patients.exists_by_mobile(data.mobile):
            raise DuplicateMobileNumberError(
                f"A patient with mobile number {data.mobile} is already registered."
            )
        if data.email and await self._patients.exists_by_email(data.email):
            raise DuplicateEmailError(f"A patient with email {data.email} is already registered.")

        uhid = await self._uhid_generator.generate()
        mrn = await self._mrn_generator.generate()
        now = datetime.now(UTC)
        patient = Patient(
            id=uuid4(),
            mrn=mrn,
            uhid=uhid,
            first_name=data.first_name.strip(),
            middle_name=data.middle_name.strip() if data.middle_name else None,
            last_name=data.last_name.strip(),
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            mobile=data.mobile.strip(),
            status=PatientStatus.ACTIVE,
            registration_date=data.registration_date or date.today(),
            created_at=now,
            updated_at=now,
            blood_group=data.blood_group,
            marital_status=data.marital_status,
            occupation=data.occupation,
            alternate_mobile=data.alternate_mobile,
            email=data.email.strip().lower() if data.email else None,
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
            created_by=data.created_by,
            updated_by=data.created_by,
        )
        return await self._patients.create(patient)
