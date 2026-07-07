from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.consultations.application.interfaces.visit_number_generator import VisitNumberGenerator
from app.modules.consultations.application.use_cases.create_consultation import CreateConsultationUseCase
from app.modules.consultations.application.use_cases.delete_consultation import DeleteConsultationUseCase
from app.modules.consultations.application.use_cases.get_consultation import GetConsultationUseCase
from app.modules.consultations.application.use_cases.get_consultations import GetConsultationsUseCase
from app.modules.consultations.application.use_cases.search_consultations import SearchConsultationsUseCase
from app.modules.consultations.application.use_cases.update_consultation import UpdateConsultationUseCase
from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository
from app.modules.consultations.infrastructure.repositories.sqlalchemy_consultation_repository import (
    SqlAlchemyConsultationRepository,
)
from app.modules.consultations.infrastructure.visit_number_generator import SqlAlchemyVisitNumberGenerator


def get_consultation_repository(db: DbSession) -> ConsultationRepository:
    return SqlAlchemyConsultationRepository(db)


def get_visit_number_generator(db: DbSession) -> VisitNumberGenerator:
    return SqlAlchemyVisitNumberGenerator(db)


ConsultationRepositoryDep = Annotated[ConsultationRepository, Depends(get_consultation_repository)]
VisitNumberGeneratorDep = Annotated[VisitNumberGenerator, Depends(get_visit_number_generator)]


def provide_create_consultation_use_case(
    consultation_repository: ConsultationRepositoryDep,
    visit_number_generator: VisitNumberGeneratorDep,
) -> CreateConsultationUseCase:
    return CreateConsultationUseCase(consultation_repository, visit_number_generator)


def provide_update_consultation_use_case(
    consultation_repository: ConsultationRepositoryDep,
) -> UpdateConsultationUseCase:
    return UpdateConsultationUseCase(consultation_repository)


def provide_delete_consultation_use_case(
    consultation_repository: ConsultationRepositoryDep,
) -> DeleteConsultationUseCase:
    return DeleteConsultationUseCase(consultation_repository)


def provide_get_consultation_use_case(
    consultation_repository: ConsultationRepositoryDep,
) -> GetConsultationUseCase:
    return GetConsultationUseCase(consultation_repository)


def provide_get_consultations_use_case(
    consultation_repository: ConsultationRepositoryDep,
) -> GetConsultationsUseCase:
    return GetConsultationsUseCase(consultation_repository)


def provide_search_consultations_use_case(
    consultation_repository: ConsultationRepositoryDep,
) -> SearchConsultationsUseCase:
    return SearchConsultationsUseCase(consultation_repository)


CreateConsultationUseCaseDep = Annotated[
    CreateConsultationUseCase, Depends(provide_create_consultation_use_case)
]
UpdateConsultationUseCaseDep = Annotated[
    UpdateConsultationUseCase, Depends(provide_update_consultation_use_case)
]
DeleteConsultationUseCaseDep = Annotated[
    DeleteConsultationUseCase, Depends(provide_delete_consultation_use_case)
]
GetConsultationUseCaseDep = Annotated[GetConsultationUseCase, Depends(provide_get_consultation_use_case)]
GetConsultationsUseCaseDep = Annotated[
    GetConsultationsUseCase, Depends(provide_get_consultations_use_case)
]
SearchConsultationsUseCaseDep = Annotated[
    SearchConsultationsUseCase, Depends(provide_search_consultations_use_case)
]

RequireConsultationsRead = Annotated[User, Depends(require_permission("consultations:read"))]
RequireConsultationsCreate = Annotated[User, Depends(require_permission("consultations:create"))]
RequireConsultationsUpdate = Annotated[User, Depends(require_permission("consultations:update"))]
RequireConsultationsDelete = Annotated[User, Depends(require_permission("consultations:delete"))]
