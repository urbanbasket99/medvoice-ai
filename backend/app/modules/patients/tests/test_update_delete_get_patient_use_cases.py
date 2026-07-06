from datetime import date
from uuid import uuid4

import pytest

from app.modules.patients.application.dto.patient_dto import CreatePatientInput, UpdatePatientInput
from app.modules.patients.application.use_cases.create_patient import CreatePatientUseCase
from app.modules.patients.application.use_cases.delete_patient import DeletePatientUseCase
from app.modules.patients.application.use_cases.get_patient import GetPatientUseCase
from app.modules.patients.application.use_cases.update_patient import UpdatePatientUseCase
from app.modules.patients.domain.entities.patient import Gender, Patient, PatientStatus
from app.modules.patients.domain.exceptions import PatientNotFoundError
from app.modules.patients.tests.fakes import FakeMrnGenerator, FakePatientRepository, FakeUhidGenerator


async def _create_sample_patient(repository: FakePatientRepository) -> Patient:
    create_use_case = CreatePatientUseCase(repository, FakeUhidGenerator(), FakeMrnGenerator())
    return await create_use_case.execute(
        CreatePatientInput(
            first_name="Vikram",
            last_name="Singh",
            date_of_birth=date(1985, 1, 1),
            gender=Gender.MALE,
            mobile="9000000001",
        )
    )


async def test_update_patient_changes_fields_and_bumps_updated_at() -> None:
    repository = FakePatientRepository()
    created = await _create_sample_patient(repository)

    update_use_case = UpdatePatientUseCase(repository)
    updated = await update_use_case.execute(
        created.id,
        UpdatePatientInput(
            first_name="Vikram",
            last_name="Singh",
            date_of_birth=created.date_of_birth,
            gender=Gender.MALE,
            mobile=created.mobile,
            status=PatientStatus.INACTIVE,
            city="Mumbai",
        ),
    )

    assert updated.city == "Mumbai"
    assert updated.status == PatientStatus.INACTIVE
    assert updated.updated_at >= created.updated_at


async def test_update_patient_raises_when_not_found() -> None:
    repository = FakePatientRepository()
    update_use_case = UpdatePatientUseCase(repository)

    with pytest.raises(PatientNotFoundError):
        await update_use_case.execute(
            uuid4(),
            UpdatePatientInput(
                first_name="Ghost",
                last_name="Patient",
                date_of_birth=date(2000, 1, 1),
                gender=Gender.OTHER,
                mobile="0000000000",
                status=PatientStatus.ACTIVE,
            ),
        )


async def test_delete_patient_is_soft_and_excludes_it_from_get() -> None:
    repository = FakePatientRepository()
    created = await _create_sample_patient(repository)

    await DeletePatientUseCase(repository).execute(created.id)

    with pytest.raises(PatientNotFoundError):
        await GetPatientUseCase(repository).execute(created.id)


async def test_delete_patient_raises_when_already_deleted() -> None:
    repository = FakePatientRepository()
    created = await _create_sample_patient(repository)
    delete_use_case = DeletePatientUseCase(repository)
    await delete_use_case.execute(created.id)

    with pytest.raises(PatientNotFoundError):
        await delete_use_case.execute(created.id)
