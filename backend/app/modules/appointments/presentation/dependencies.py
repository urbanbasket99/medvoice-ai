from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.appointments.application.interfaces.appointment_number_generator import (
    AppointmentNumberGenerator,
)
from app.modules.appointments.application.use_cases.create_appointment import CreateAppointmentUseCase
from app.modules.appointments.application.use_cases.delete_appointment import DeleteAppointmentUseCase
from app.modules.appointments.application.use_cases.get_appointment import GetAppointmentUseCase
from app.modules.appointments.application.use_cases.get_appointments import GetAppointmentsUseCase
from app.modules.appointments.application.use_cases.search_appointments import SearchAppointmentsUseCase
from app.modules.appointments.application.use_cases.update_appointment import UpdateAppointmentUseCase
from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository
from app.modules.appointments.infrastructure.appointment_number_generator import (
    SqlAlchemyAppointmentNumberGenerator,
)
from app.modules.appointments.infrastructure.repositories.sqlalchemy_appointment_repository import (
    SqlAlchemyAppointmentRepository,
)


def get_appointment_repository(db: DbSession) -> AppointmentRepository:
    return SqlAlchemyAppointmentRepository(db)


def get_appointment_number_generator(db: DbSession) -> AppointmentNumberGenerator:
    return SqlAlchemyAppointmentNumberGenerator(db)


AppointmentRepositoryDep = Annotated[AppointmentRepository, Depends(get_appointment_repository)]
AppointmentNumberGeneratorDep = Annotated[
    AppointmentNumberGenerator, Depends(get_appointment_number_generator)
]


def provide_create_appointment_use_case(
    appointment_repository: AppointmentRepositoryDep,
    number_generator: AppointmentNumberGeneratorDep,
) -> CreateAppointmentUseCase:
    return CreateAppointmentUseCase(appointment_repository, number_generator)


def provide_update_appointment_use_case(
    appointment_repository: AppointmentRepositoryDep,
) -> UpdateAppointmentUseCase:
    return UpdateAppointmentUseCase(appointment_repository)


def provide_delete_appointment_use_case(
    appointment_repository: AppointmentRepositoryDep,
) -> DeleteAppointmentUseCase:
    return DeleteAppointmentUseCase(appointment_repository)


def provide_get_appointment_use_case(
    appointment_repository: AppointmentRepositoryDep,
) -> GetAppointmentUseCase:
    return GetAppointmentUseCase(appointment_repository)


def provide_get_appointments_use_case(
    appointment_repository: AppointmentRepositoryDep,
) -> GetAppointmentsUseCase:
    return GetAppointmentsUseCase(appointment_repository)


def provide_search_appointments_use_case(
    appointment_repository: AppointmentRepositoryDep,
) -> SearchAppointmentsUseCase:
    return SearchAppointmentsUseCase(appointment_repository)


CreateAppointmentUseCaseDep = Annotated[
    CreateAppointmentUseCase, Depends(provide_create_appointment_use_case)
]
UpdateAppointmentUseCaseDep = Annotated[
    UpdateAppointmentUseCase, Depends(provide_update_appointment_use_case)
]
DeleteAppointmentUseCaseDep = Annotated[
    DeleteAppointmentUseCase, Depends(provide_delete_appointment_use_case)
]
GetAppointmentUseCaseDep = Annotated[GetAppointmentUseCase, Depends(provide_get_appointment_use_case)]
GetAppointmentsUseCaseDep = Annotated[
    GetAppointmentsUseCase, Depends(provide_get_appointments_use_case)
]
SearchAppointmentsUseCaseDep = Annotated[
    SearchAppointmentsUseCase, Depends(provide_search_appointments_use_case)
]

RequireAppointmentsRead = Annotated[User, Depends(require_permission("appointments:read"))]
RequireAppointmentsCreate = Annotated[User, Depends(require_permission("appointments:create"))]
RequireAppointmentsUpdate = Annotated[User, Depends(require_permission("appointments:update"))]
RequireAppointmentsDelete = Annotated[User, Depends(require_permission("appointments:delete"))]
