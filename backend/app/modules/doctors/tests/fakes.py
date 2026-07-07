"""In-memory `DoctorRepository`/`DoctorCodeGenerator` fakes used only by tests.

Exercising the use cases against these instead of a real database is what
Dependency Inversion buys us: every use case here is tested with zero I/O.
Mirrors `app.modules.patients.tests.fakes`.
"""

from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from app.modules.doctors.domain.entities.doctor import Doctor
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository
from app.modules.doctors.domain.value_objects import DoctorListCriteria, DoctorPage, SortDirection


class FakeDoctorRepository(DoctorRepository):
    def __init__(self, initial: list[Doctor] | None = None) -> None:
        self._doctors: dict[UUID, Doctor] = {doctor.id: doctor for doctor in (initial or [])}

    async def get_by_id(self, doctor_id: UUID) -> Doctor | None:
        doctor = self._doctors.get(doctor_id)
        return doctor if doctor and not doctor.is_deleted else None

    async def get_by_code(self, doctor_code: str) -> Doctor | None:
        for doctor in self._doctors.values():
            if doctor.doctor_code == doctor_code and not doctor.is_deleted:
                return doctor
        return None

    async def exists_by_mobile(self, mobile: str, exclude_id: UUID | None = None) -> bool:
        return any(
            doctor.mobile == mobile and not doctor.is_deleted and doctor.id != exclude_id
            for doctor in self._doctors.values()
        )

    async def exists_by_email(self, email: str, exclude_id: UUID | None = None) -> bool:
        return any(
            doctor.email == email.lower() and not doctor.is_deleted and doctor.id != exclude_id
            for doctor in self._doctors.values()
        )

    async def exists_by_registration_number(
        self, registration_number: str, exclude_id: UUID | None = None
    ) -> bool:
        return any(
            doctor.registration_number == registration_number
            and not doctor.is_deleted
            and doctor.id != exclude_id
            for doctor in self._doctors.values()
        )

    async def create(self, doctor: Doctor) -> Doctor:
        self._doctors[doctor.id] = doctor
        return doctor

    async def update(self, doctor: Doctor) -> Doctor:
        self._doctors[doctor.id] = doctor
        return doctor

    async def soft_delete(self, doctor_id: UUID) -> bool:
        doctor = self._doctors.get(doctor_id)
        if doctor is None or doctor.is_deleted:
            return False
        self._doctors[doctor_id] = replace(doctor, deleted_at=datetime.now(UTC))
        return True

    async def list_doctors(self, criteria: DoctorListCriteria) -> DoctorPage:
        items = [doctor for doctor in self._doctors.values() if not doctor.is_deleted]
        if criteria.status is not None:
            items = [doctor for doctor in items if doctor.status == criteria.status]
        if criteria.department is not None:
            items = [doctor for doctor in items if doctor.department == criteria.department]
        if criteria.gender is not None:
            items = [doctor for doctor in items if doctor.gender == criteria.gender]

        items.sort(
            key=lambda doctor: getattr(doctor, criteria.sort_by.value),
            reverse=criteria.sort_dir == SortDirection.DESC,
        )
        start = (criteria.page - 1) * criteria.page_size
        page_items = items[start : start + criteria.page_size]
        return DoctorPage(
            items=page_items, total=len(items), page=criteria.page, page_size=criteria.page_size
        )

    async def search_doctors(self, query: str, page: int, page_size: int) -> DoctorPage:
        needle = query.lower()
        items = [
            doctor
            for doctor in self._doctors.values()
            if not doctor.is_deleted
            and (
                needle in doctor.doctor_code.lower()
                or needle in doctor.full_name.lower()
                or needle in doctor.registration_number.lower()
                or needle in doctor.mobile.lower()
                or (doctor.email is not None and needle in doctor.email.lower())
            )
        ]
        start = (page - 1) * page_size
        page_items = items[start : start + page_size]
        return DoctorPage(items=page_items, total=len(items), page=page, page_size=page_size)


class FakeDoctorCodeGenerator:
    def __init__(self) -> None:
        self._counter = 0

    async def generate(self) -> str:
        self._counter += 1
        return f"DOC-TEST-{self._counter:06d}"
