from datetime import date

from app.modules.patients.application.dto.patient_dto import CreatePatientInput
from app.modules.patients.application.use_cases.create_patient import CreatePatientUseCase
from app.modules.patients.application.use_cases.get_patients import GetPatientsUseCase
from app.modules.patients.application.use_cases.search_patients import SearchPatientsUseCase
from app.modules.patients.domain.entities.patient import Gender, PatientStatus
from app.modules.patients.domain.value_objects import PatientListCriteria
from app.modules.patients.tests.fakes import FakeMrnGenerator, FakePatientRepository, FakeUhidGenerator


async def _seed_patients(repository: FakePatientRepository) -> None:
    create_use_case = CreatePatientUseCase(repository, FakeUhidGenerator(), FakeMrnGenerator())
    await create_use_case.execute(
        CreatePatientInput(
            first_name="Anita",
            last_name="Verma",
            date_of_birth=date(1992, 3, 4),
            gender=Gender.FEMALE,
            mobile="9111111111",
            email="anita.verma@example.com",
        )
    )
    await create_use_case.execute(
        CreatePatientInput(
            first_name="Rohit",
            last_name="Sharma",
            date_of_birth=date(1988, 7, 20),
            gender=Gender.MALE,
            mobile="9222222222",
            email="rohit.sharma@example.com",
        )
    )


async def test_get_patients_paginates_and_filters_by_gender() -> None:
    repository = FakePatientRepository()
    await _seed_patients(repository)

    result = await GetPatientsUseCase(repository).execute(
        PatientListCriteria(page=1, page_size=10, status=PatientStatus.ACTIVE, gender=Gender.MALE)
    )

    assert result.total == 1
    assert result.items[0].last_name == "Sharma"


async def test_search_patients_matches_across_name_mobile_and_email() -> None:
    repository = FakePatientRepository()
    await _seed_patients(repository)

    by_name = await SearchPatientsUseCase(repository).execute("verma")
    by_mobile = await SearchPatientsUseCase(repository).execute("9222222222")
    by_blank = await SearchPatientsUseCase(repository).execute("   ")

    assert by_name.total == 1
    assert by_name.items[0].first_name == "Anita"
    assert by_mobile.items[0].last_name == "Sharma"
    assert by_blank.total == 0
