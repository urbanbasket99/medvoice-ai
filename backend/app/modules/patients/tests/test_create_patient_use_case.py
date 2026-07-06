from datetime import date

import pytest

from app.modules.patients.application.dto.patient_dto import CreatePatientInput
from app.modules.patients.application.use_cases.create_patient import CreatePatientUseCase
from app.modules.patients.domain.entities.patient import Gender, PatientStatus
from app.modules.patients.domain.exceptions import DuplicateEmailError, DuplicateMobileNumberError
from app.modules.patients.tests.fakes import FakeMrnGenerator, FakePatientRepository, FakeUhidGenerator


def _make_input(**overrides: object) -> CreatePatientInput:
    defaults: dict[str, object] = {
        "first_name": "Asha",
        "last_name": "Rao",
        "date_of_birth": date(1990, 5, 12),
        "gender": Gender.FEMALE,
        "mobile": "9876543210",
        "email": "asha.rao@example.com",
    }
    defaults.update(overrides)
    return CreatePatientInput(**defaults)  # type: ignore[arg-type]


def _make_use_case(repository: FakePatientRepository) -> CreatePatientUseCase:
    return CreatePatientUseCase(repository, FakeUhidGenerator(), FakeMrnGenerator())


async def test_create_patient_assigns_a_generated_uhid_and_active_status() -> None:
    use_case = _make_use_case(FakePatientRepository())

    patient = await use_case.execute(_make_input())

    assert patient.uhid == "MVH-TEST-000001"
    assert patient.mrn == "MRN-TEST-000001"
    assert patient.status == PatientStatus.ACTIVE
    assert patient.full_name == "Asha Rao"


async def test_create_patient_rejects_duplicate_mobile_number() -> None:
    repository = FakePatientRepository()
    use_case = _make_use_case(repository)
    await use_case.execute(_make_input())

    with pytest.raises(DuplicateMobileNumberError):
        await use_case.execute(_make_input(email="different@example.com"))


async def test_create_patient_rejects_duplicate_email() -> None:
    repository = FakePatientRepository()
    use_case = _make_use_case(repository)
    await use_case.execute(_make_input())

    with pytest.raises(DuplicateEmailError):
        await use_case.execute(_make_input(mobile="9999999999"))
