"""Dependency injection wiring for the Doctors bounded context.

Mirrors `app/modules/patients/presentation/dependencies.py`: the only
place that imports both the abstract ports (`app.modules.doctors.domain.*`,
`app.modules.doctors.application.interfaces.*`) and their concrete
adapters (`app.modules.doctors.infrastructure.*`). Route handlers in
`router.py` only ever see the use cases and the RBAC dependencies below.
"""

from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.doctors.application.interfaces.doctor_code_generator import DoctorCodeGenerator
from app.modules.doctors.application.use_cases.create_doctor import CreateDoctorUseCase
from app.modules.doctors.application.use_cases.delete_doctor import DeleteDoctorUseCase
from app.modules.doctors.application.use_cases.get_doctor import GetDoctorUseCase
from app.modules.doctors.application.use_cases.get_doctor_availability import (
    GetDoctorAvailabilityUseCase,
)
from app.modules.doctors.application.use_cases.get_doctors import GetDoctorsUseCase
from app.modules.doctors.application.use_cases.replace_doctor_availability import (
    ReplaceDoctorAvailabilityUseCase,
)
from app.modules.doctors.application.use_cases.search_doctors import SearchDoctorsUseCase
from app.modules.doctors.application.use_cases.update_doctor import UpdateDoctorUseCase
from app.modules.doctors.domain.repositories.doctor_availability_repository import (
    DoctorAvailabilityRepository,
)
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository
from app.modules.doctors.infrastructure.doctor_code_generator import SqlAlchemyDoctorCodeGenerator
from app.modules.doctors.infrastructure.repositories.sqlalchemy_doctor_availability_repository import (
    SqlAlchemyDoctorAvailabilityRepository,
)
from app.modules.doctors.infrastructure.repositories.sqlalchemy_doctor_repository import (
    SqlAlchemyDoctorRepository,
)


def get_doctor_repository(db: DbSession) -> DoctorRepository:
    return SqlAlchemyDoctorRepository(db)


def get_doctor_availability_repository(db: DbSession) -> DoctorAvailabilityRepository:
    return SqlAlchemyDoctorAvailabilityRepository(db)


def get_doctor_code_generator(db: DbSession) -> DoctorCodeGenerator:
    return SqlAlchemyDoctorCodeGenerator(db)


DoctorRepositoryDep = Annotated[DoctorRepository, Depends(get_doctor_repository)]
DoctorAvailabilityRepositoryDep = Annotated[
    DoctorAvailabilityRepository, Depends(get_doctor_availability_repository)
]
DoctorCodeGeneratorDep = Annotated[DoctorCodeGenerator, Depends(get_doctor_code_generator)]


def provide_create_doctor_use_case(
    doctor_repository: DoctorRepositoryDep,
    code_generator: DoctorCodeGeneratorDep,
) -> CreateDoctorUseCase:
    return CreateDoctorUseCase(doctor_repository, code_generator)


def provide_update_doctor_use_case(doctor_repository: DoctorRepositoryDep) -> UpdateDoctorUseCase:
    return UpdateDoctorUseCase(doctor_repository)


def provide_delete_doctor_use_case(doctor_repository: DoctorRepositoryDep) -> DeleteDoctorUseCase:
    return DeleteDoctorUseCase(doctor_repository)


def provide_get_doctor_use_case(doctor_repository: DoctorRepositoryDep) -> GetDoctorUseCase:
    return GetDoctorUseCase(doctor_repository)


def provide_get_doctors_use_case(doctor_repository: DoctorRepositoryDep) -> GetDoctorsUseCase:
    return GetDoctorsUseCase(doctor_repository)


def provide_search_doctors_use_case(doctor_repository: DoctorRepositoryDep) -> SearchDoctorsUseCase:
    return SearchDoctorsUseCase(doctor_repository)


def provide_get_doctor_availability_use_case(
    doctor_repository: DoctorRepositoryDep,
    availability_repository: DoctorAvailabilityRepositoryDep,
) -> GetDoctorAvailabilityUseCase:
    return GetDoctorAvailabilityUseCase(doctor_repository, availability_repository)


def provide_replace_doctor_availability_use_case(
    doctor_repository: DoctorRepositoryDep,
    availability_repository: DoctorAvailabilityRepositoryDep,
) -> ReplaceDoctorAvailabilityUseCase:
    return ReplaceDoctorAvailabilityUseCase(doctor_repository, availability_repository)


CreateDoctorUseCaseDep = Annotated[CreateDoctorUseCase, Depends(provide_create_doctor_use_case)]
UpdateDoctorUseCaseDep = Annotated[UpdateDoctorUseCase, Depends(provide_update_doctor_use_case)]
DeleteDoctorUseCaseDep = Annotated[DeleteDoctorUseCase, Depends(provide_delete_doctor_use_case)]
GetDoctorUseCaseDep = Annotated[GetDoctorUseCase, Depends(provide_get_doctor_use_case)]
GetDoctorsUseCaseDep = Annotated[GetDoctorsUseCase, Depends(provide_get_doctors_use_case)]
SearchDoctorsUseCaseDep = Annotated[SearchDoctorsUseCase, Depends(provide_search_doctors_use_case)]
GetDoctorAvailabilityUseCaseDep = Annotated[
    GetDoctorAvailabilityUseCase, Depends(provide_get_doctor_availability_use_case)
]
ReplaceDoctorAvailabilityUseCaseDep = Annotated[
    ReplaceDoctorAvailabilityUseCase, Depends(provide_replace_doctor_availability_use_case)
]

# RBAC: one dependency per permission, enforced via the shared
# `require_permission` factory from the Authentication module (not
# duplicated — reused exactly as-is).
RequireDoctorsRead = Annotated[User, Depends(require_permission("doctors:read"))]
RequireDoctorsCreate = Annotated[User, Depends(require_permission("doctors:create"))]
RequireDoctorsUpdate = Annotated[User, Depends(require_permission("doctors:update"))]
RequireDoctorsDelete = Annotated[User, Depends(require_permission("doctors:delete"))]
