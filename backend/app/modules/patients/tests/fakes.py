"""In-memory `PatientRepository`/`UhidGenerator` fakes used only by tests.

Exercising the use cases against these instead of a real database is what
Dependency Inversion buys us: every use case here is tested with zero I/O.
"""

from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from app.modules.patients.domain.entities.patient import Patient
from app.modules.patients.domain.repositories.patient_repository import PatientRepository
from app.modules.patients.domain.value_objects import PatientListCriteria, PatientPage, SortDirection


class FakePatientRepository(PatientRepository):
    def __init__(self, initial: list[Patient] | None = None) -> None:
        self._patients: dict[UUID, Patient] = {patient.id: patient for patient in (initial or [])}

    async def get_by_id(self, patient_id: UUID) -> Patient | None:
        patient = self._patients.get(patient_id)
        return patient if patient and not patient.is_deleted else None

    async def get_by_uhid(self, uhid: str) -> Patient | None:
        for patient in self._patients.values():
            if patient.uhid == uhid and not patient.is_deleted:
                return patient
        return None

    async def exists_by_mobile(self, mobile: str, exclude_id: UUID | None = None) -> bool:
        return any(
            patient.mobile == mobile and not patient.is_deleted and patient.id != exclude_id
            for patient in self._patients.values()
        )

    async def exists_by_email(self, email: str, exclude_id: UUID | None = None) -> bool:
        return any(
            patient.email == email.lower() and not patient.is_deleted and patient.id != exclude_id
            for patient in self._patients.values()
        )

    async def create(self, patient: Patient) -> Patient:
        self._patients[patient.id] = patient
        return patient

    async def update(self, patient: Patient) -> Patient:
        self._patients[patient.id] = patient
        return patient

    async def soft_delete(self, patient_id: UUID) -> bool:
        patient = self._patients.get(patient_id)
        if patient is None or patient.is_deleted:
            return False
        self._patients[patient_id] = replace(patient, deleted_at=datetime.now(UTC))
        return True

    async def list_patients(self, criteria: PatientListCriteria) -> PatientPage:
        items = [patient for patient in self._patients.values() if not patient.is_deleted]
        if criteria.status is not None:
            items = [patient for patient in items if patient.status == criteria.status]
        if criteria.gender is not None:
            items = [patient for patient in items if patient.gender == criteria.gender]

        items.sort(
            key=lambda patient: getattr(patient, criteria.sort_by.value),
            reverse=criteria.sort_dir == SortDirection.DESC,
        )
        start = (criteria.page - 1) * criteria.page_size
        page_items = items[start : start + criteria.page_size]
        return PatientPage(
            items=page_items, total=len(items), page=criteria.page, page_size=criteria.page_size
        )

    async def search_patients(self, query: str, page: int, page_size: int) -> PatientPage:
        needle = query.lower()
        items = [
            patient
            for patient in self._patients.values()
            if not patient.is_deleted
            and (
                needle in patient.uhid.lower()
                or needle in patient.first_name.lower()
                or needle in patient.last_name.lower()
                or needle in patient.mobile.lower()
                or (patient.email is not None and needle in patient.email.lower())
            )
        ]
        start = (page - 1) * page_size
        page_items = items[start : start + page_size]
        return PatientPage(items=page_items, total=len(items), page=page, page_size=page_size)


class FakeUhidGenerator:
    def __init__(self) -> None:
        self._counter = 0

    async def generate(self) -> str:
        self._counter += 1
        return f"MVH-TEST-{self._counter:06d}"


class FakeMrnGenerator:
    def __init__(self) -> None:
        self._counter = 0

    async def generate(self) -> str:
        self._counter += 1
        return f"MRN-TEST-{self._counter:06d}"
