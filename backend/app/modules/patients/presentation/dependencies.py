"""Dependency injection wiring for the Patients bounded context.

Mirrors the role `app/api/deps.py` plays for Authentication: the only
place that imports both the abstract ports (`app.modules.patients.domain.*`,
`app.modules.patients.application.interfaces.*`) and their concrete
adapters (`app.modules.patients.infrastructure.*`). Route handlers in
`router.py` only ever see the use cases and the RBAC dependencies below.
"""

from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.patients.application.interfaces.mrn_generator import MrnGenerator
from app.modules.patients.application.interfaces.uhid_generator import UhidGenerator
from app.modules.patients.application.use_cases.create_patient import CreatePatientUseCase
from app.modules.patients.application.use_cases.delete_patient import DeletePatientUseCase
from app.modules.patients.application.use_cases.get_patient import GetPatientUseCase
from app.modules.patients.application.use_cases.get_patients import GetPatientsUseCase
from app.modules.patients.application.use_cases.search_patients import SearchPatientsUseCase
from app.modules.patients.application.use_cases.update_patient import UpdatePatientUseCase
from app.modules.patients.domain.repositories.patient_repository import PatientRepository
from app.modules.patients.infrastructure.mrn_generator import SqlAlchemyMrnGenerator
from app.modules.patients.infrastructure.repositories.sqlalchemy_patient_repository import (
    SqlAlchemyPatientRepository,
)
from app.modules.patients.infrastructure.uhid_generator import SqlAlchemyUhidGenerator


def get_patient_repository(db: DbSession) -> PatientRepository:
    return SqlAlchemyPatientRepository(db)


def get_uhid_generator(db: DbSession) -> UhidGenerator:
    return SqlAlchemyUhidGenerator(db)


def get_mrn_generator(db: DbSession) -> MrnGenerator:
    return SqlAlchemyMrnGenerator(db)


PatientRepositoryDep = Annotated[PatientRepository, Depends(get_patient_repository)]
UhidGeneratorDep = Annotated[UhidGenerator, Depends(get_uhid_generator)]
MrnGeneratorDep = Annotated[MrnGenerator, Depends(get_mrn_generator)]


def provide_create_patient_use_case(
    patient_repository: PatientRepositoryDep,
    uhid_generator: UhidGeneratorDep,
    mrn_generator: MrnGeneratorDep,
) -> CreatePatientUseCase:
    return CreatePatientUseCase(patient_repository, uhid_generator, mrn_generator)


def provide_update_patient_use_case(patient_repository: PatientRepositoryDep) -> UpdatePatientUseCase:
    return UpdatePatientUseCase(patient_repository)


def provide_delete_patient_use_case(patient_repository: PatientRepositoryDep) -> DeletePatientUseCase:
    return DeletePatientUseCase(patient_repository)


def provide_get_patient_use_case(patient_repository: PatientRepositoryDep) -> GetPatientUseCase:
    return GetPatientUseCase(patient_repository)


def provide_get_patients_use_case(patient_repository: PatientRepositoryDep) -> GetPatientsUseCase:
    return GetPatientsUseCase(patient_repository)


def provide_search_patients_use_case(patient_repository: PatientRepositoryDep) -> SearchPatientsUseCase:
    return SearchPatientsUseCase(patient_repository)


CreatePatientUseCaseDep = Annotated[CreatePatientUseCase, Depends(provide_create_patient_use_case)]
UpdatePatientUseCaseDep = Annotated[UpdatePatientUseCase, Depends(provide_update_patient_use_case)]
DeletePatientUseCaseDep = Annotated[DeletePatientUseCase, Depends(provide_delete_patient_use_case)]
GetPatientUseCaseDep = Annotated[GetPatientUseCase, Depends(provide_get_patient_use_case)]
GetPatientsUseCaseDep = Annotated[GetPatientsUseCase, Depends(provide_get_patients_use_case)]
SearchPatientsUseCaseDep = Annotated[SearchPatientsUseCase, Depends(provide_search_patients_use_case)]

# RBAC: one dependency per permission, enforced via the shared
# `require_permission` factory from the Authentication module (not
# duplicated — reused exactly as-is).
RequirePatientsRead = Annotated[User, Depends(require_permission("patients:read"))]
RequirePatientsCreate = Annotated[User, Depends(require_permission("patients:create"))]
RequirePatientsUpdate = Annotated[User, Depends(require_permission("patients:update"))]
RequirePatientsDelete = Annotated[User, Depends(require_permission("patients:delete"))]
