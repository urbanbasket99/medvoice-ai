from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.laboratory.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.laboratory.application.interfaces.lab_order_number_generator import LabOrderNumberGenerator
from app.modules.laboratory.application.use_cases.create_lab_order import CreateLabOrderUseCase
from app.modules.laboratory.application.use_cases.delete_lab_order import DeleteLabOrderUseCase
from app.modules.laboratory.application.use_cases.get_lab_order import GetLabOrderUseCase
from app.modules.laboratory.application.use_cases.get_lab_order_print import GetLabOrderPrintUseCase
from app.modules.laboratory.application.use_cases.get_lab_orders import GetLabOrdersUseCase
from app.modules.laboratory.application.use_cases.get_lab_tests import GetLabTestsUseCase
from app.modules.laboratory.application.use_cases.search_lab_orders import SearchLabOrdersUseCase
from app.modules.laboratory.application.use_cases.search_lab_tests import SearchLabTestsUseCase
from app.modules.laboratory.application.use_cases.update_lab_order import UpdateLabOrderUseCase
from app.modules.laboratory.application.use_cases.update_lab_order_status import UpdateLabOrderStatusUseCase
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.domain.repositories.lab_test_master_repository import LabTestMasterRepository
from app.modules.laboratory.infrastructure.lab_order_number_generator import SqlAlchemyLabOrderNumberGenerator
from app.modules.laboratory.infrastructure.repositories.consultation_lookup import SqlAlchemyConsultationLookup
from app.modules.laboratory.infrastructure.repositories.sqlalchemy_lab_order_repository import (
    SqlAlchemyLabOrderRepository,
)
from app.modules.laboratory.infrastructure.repositories.sqlalchemy_lab_test_master_repository import (
    SqlAlchemyLabTestMasterRepository,
)


def get_lab_order_repository(db: DbSession) -> LabOrderRepository:
    return SqlAlchemyLabOrderRepository(db)


def get_lab_test_master_repository(db: DbSession) -> LabTestMasterRepository:
    return SqlAlchemyLabTestMasterRepository(db)


def get_consultation_lookup(db: DbSession) -> ConsultationLookup:
    return SqlAlchemyConsultationLookup(db)


def get_lab_order_number_generator(db: DbSession) -> LabOrderNumberGenerator:
    return SqlAlchemyLabOrderNumberGenerator(db)


LabOrderRepositoryDep = Annotated[LabOrderRepository, Depends(get_lab_order_repository)]
LabTestMasterRepositoryDep = Annotated[LabTestMasterRepository, Depends(get_lab_test_master_repository)]
ConsultationLookupDep = Annotated[ConsultationLookup, Depends(get_consultation_lookup)]
LabOrderNumberGeneratorDep = Annotated[LabOrderNumberGenerator, Depends(get_lab_order_number_generator)]


def provide_create_lab_order_use_case(
    lab_order_repository: LabOrderRepositoryDep,
    consultation_lookup: ConsultationLookupDep,
    order_number_generator: LabOrderNumberGeneratorDep,
) -> CreateLabOrderUseCase:
    return CreateLabOrderUseCase(lab_order_repository, consultation_lookup, order_number_generator)


def provide_update_lab_order_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> UpdateLabOrderUseCase:
    return UpdateLabOrderUseCase(lab_order_repository)


def provide_update_lab_order_status_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> UpdateLabOrderStatusUseCase:
    return UpdateLabOrderStatusUseCase(lab_order_repository)


def provide_delete_lab_order_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> DeleteLabOrderUseCase:
    return DeleteLabOrderUseCase(lab_order_repository)


def provide_get_lab_order_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> GetLabOrderUseCase:
    return GetLabOrderUseCase(lab_order_repository)


def provide_get_lab_orders_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> GetLabOrdersUseCase:
    return GetLabOrdersUseCase(lab_order_repository)


def provide_search_lab_orders_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> SearchLabOrdersUseCase:
    return SearchLabOrdersUseCase(lab_order_repository)


def provide_search_lab_tests_use_case(
    lab_test_repository: LabTestMasterRepositoryDep,
) -> SearchLabTestsUseCase:
    return SearchLabTestsUseCase(lab_test_repository)


def provide_get_lab_tests_use_case(
    lab_test_repository: LabTestMasterRepositoryDep,
) -> GetLabTestsUseCase:
    return GetLabTestsUseCase(lab_test_repository)


def provide_get_lab_order_print_use_case(
    lab_order_repository: LabOrderRepositoryDep,
) -> GetLabOrderPrintUseCase:
    return GetLabOrderPrintUseCase(lab_order_repository)


CreateLabOrderUseCaseDep = Annotated[CreateLabOrderUseCase, Depends(provide_create_lab_order_use_case)]
UpdateLabOrderUseCaseDep = Annotated[UpdateLabOrderUseCase, Depends(provide_update_lab_order_use_case)]
UpdateLabOrderStatusUseCaseDep = Annotated[
    UpdateLabOrderStatusUseCase, Depends(provide_update_lab_order_status_use_case)
]
DeleteLabOrderUseCaseDep = Annotated[DeleteLabOrderUseCase, Depends(provide_delete_lab_order_use_case)]
GetLabOrderUseCaseDep = Annotated[GetLabOrderUseCase, Depends(provide_get_lab_order_use_case)]
GetLabOrdersUseCaseDep = Annotated[GetLabOrdersUseCase, Depends(provide_get_lab_orders_use_case)]
SearchLabOrdersUseCaseDep = Annotated[SearchLabOrdersUseCase, Depends(provide_search_lab_orders_use_case)]
SearchLabTestsUseCaseDep = Annotated[SearchLabTestsUseCase, Depends(provide_search_lab_tests_use_case)]
GetLabTestsUseCaseDep = Annotated[GetLabTestsUseCase, Depends(provide_get_lab_tests_use_case)]
GetLabOrderPrintUseCaseDep = Annotated[GetLabOrderPrintUseCase, Depends(provide_get_lab_order_print_use_case)]

RequireLaboratoryRead = Annotated[User, Depends(require_permission("laboratory:read"))]
RequireLaboratoryCreate = Annotated[User, Depends(require_permission("laboratory:create"))]
RequireLaboratoryUpdate = Annotated[User, Depends(require_permission("laboratory:update"))]
RequireLaboratoryDelete = Annotated[User, Depends(require_permission("laboratory:delete"))]
