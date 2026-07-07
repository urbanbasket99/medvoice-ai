from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.radiology.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.radiology.application.interfaces.radiology_order_number_generator import (
    RadiologyOrderNumberGenerator,
)
from app.modules.radiology.application.use_cases.create_radiology_order import CreateRadiologyOrderUseCase
from app.modules.radiology.application.use_cases.delete_radiology_order import DeleteRadiologyOrderUseCase
from app.modules.radiology.application.use_cases.get_radiology_order import GetRadiologyOrderUseCase
from app.modules.radiology.application.use_cases.get_radiology_order_print import GetRadiologyOrderPrintUseCase
from app.modules.radiology.application.use_cases.get_radiology_orders import GetRadiologyOrdersUseCase
from app.modules.radiology.application.use_cases.get_radiology_tests import GetRadiologyTestsUseCase
from app.modules.radiology.application.use_cases.search_radiology_orders import SearchRadiologyOrdersUseCase
from app.modules.radiology.application.use_cases.search_radiology_tests import SearchRadiologyTestsUseCase
from app.modules.radiology.application.use_cases.update_radiology_order import UpdateRadiologyOrderUseCase
from app.modules.radiology.application.use_cases.update_radiology_order_status import (
    UpdateRadiologyOrderStatusUseCase,
)
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.radiology.domain.repositories.radiology_test_master_repository import (
    RadiologyTestMasterRepository,
)
from app.modules.radiology.infrastructure.radiology_order_number_generator import (
    SqlAlchemyRadiologyOrderNumberGenerator,
)
from app.modules.radiology.infrastructure.repositories.consultation_lookup import SqlAlchemyConsultationLookup
from app.modules.radiology.infrastructure.repositories.sqlalchemy_radiology_order_repository import (
    SqlAlchemyRadiologyOrderRepository,
)
from app.modules.radiology.infrastructure.repositories.sqlalchemy_radiology_test_master_repository import (
    SqlAlchemyRadiologyTestMasterRepository,
)


def get_radiology_order_repository(db: DbSession) -> RadiologyOrderRepository:
    return SqlAlchemyRadiologyOrderRepository(db)


def get_radiology_test_master_repository(db: DbSession) -> RadiologyTestMasterRepository:
    return SqlAlchemyRadiologyTestMasterRepository(db)


def get_consultation_lookup(db: DbSession) -> ConsultationLookup:
    return SqlAlchemyConsultationLookup(db)


def get_radiology_order_number_generator(db: DbSession) -> RadiologyOrderNumberGenerator:
    return SqlAlchemyRadiologyOrderNumberGenerator(db)


RadiologyOrderRepositoryDep = Annotated[RadiologyOrderRepository, Depends(get_radiology_order_repository)]
RadiologyTestMasterRepositoryDep = Annotated[
    RadiologyTestMasterRepository, Depends(get_radiology_test_master_repository)
]
ConsultationLookupDep = Annotated[ConsultationLookup, Depends(get_consultation_lookup)]
RadiologyOrderNumberGeneratorDep = Annotated[
    RadiologyOrderNumberGenerator, Depends(get_radiology_order_number_generator)
]


def provide_create_radiology_order_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
    consultation_lookup: ConsultationLookupDep,
    order_number_generator: RadiologyOrderNumberGeneratorDep,
) -> CreateRadiologyOrderUseCase:
    return CreateRadiologyOrderUseCase(
        radiology_order_repository, consultation_lookup, order_number_generator
    )


def provide_update_radiology_order_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> UpdateRadiologyOrderUseCase:
    return UpdateRadiologyOrderUseCase(radiology_order_repository)


def provide_update_radiology_order_status_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> UpdateRadiologyOrderStatusUseCase:
    return UpdateRadiologyOrderStatusUseCase(radiology_order_repository)


def provide_delete_radiology_order_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> DeleteRadiologyOrderUseCase:
    return DeleteRadiologyOrderUseCase(radiology_order_repository)


def provide_get_radiology_order_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> GetRadiologyOrderUseCase:
    return GetRadiologyOrderUseCase(radiology_order_repository)


def provide_get_radiology_orders_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> GetRadiologyOrdersUseCase:
    return GetRadiologyOrdersUseCase(radiology_order_repository)


def provide_search_radiology_orders_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> SearchRadiologyOrdersUseCase:
    return SearchRadiologyOrdersUseCase(radiology_order_repository)


def provide_search_radiology_tests_use_case(
    radiology_test_repository: RadiologyTestMasterRepositoryDep,
) -> SearchRadiologyTestsUseCase:
    return SearchRadiologyTestsUseCase(radiology_test_repository)


def provide_get_radiology_tests_use_case(
    radiology_test_repository: RadiologyTestMasterRepositoryDep,
) -> GetRadiologyTestsUseCase:
    return GetRadiologyTestsUseCase(radiology_test_repository)


def provide_get_radiology_order_print_use_case(
    radiology_order_repository: RadiologyOrderRepositoryDep,
) -> GetRadiologyOrderPrintUseCase:
    return GetRadiologyOrderPrintUseCase(radiology_order_repository)


CreateRadiologyOrderUseCaseDep = Annotated[
    CreateRadiologyOrderUseCase, Depends(provide_create_radiology_order_use_case)
]
UpdateRadiologyOrderUseCaseDep = Annotated[
    UpdateRadiologyOrderUseCase, Depends(provide_update_radiology_order_use_case)
]
UpdateRadiologyOrderStatusUseCaseDep = Annotated[
    UpdateRadiologyOrderStatusUseCase, Depends(provide_update_radiology_order_status_use_case)
]
DeleteRadiologyOrderUseCaseDep = Annotated[
    DeleteRadiologyOrderUseCase, Depends(provide_delete_radiology_order_use_case)
]
GetRadiologyOrderUseCaseDep = Annotated[
    GetRadiologyOrderUseCase, Depends(provide_get_radiology_order_use_case)
]
GetRadiologyOrdersUseCaseDep = Annotated[
    GetRadiologyOrdersUseCase, Depends(provide_get_radiology_orders_use_case)
]
SearchRadiologyOrdersUseCaseDep = Annotated[
    SearchRadiologyOrdersUseCase, Depends(provide_search_radiology_orders_use_case)
]
SearchRadiologyTestsUseCaseDep = Annotated[
    SearchRadiologyTestsUseCase, Depends(provide_search_radiology_tests_use_case)
]
GetRadiologyTestsUseCaseDep = Annotated[
    GetRadiologyTestsUseCase, Depends(provide_get_radiology_tests_use_case)
]
GetRadiologyOrderPrintUseCaseDep = Annotated[
    GetRadiologyOrderPrintUseCase, Depends(provide_get_radiology_order_print_use_case)
]

RequireRadiologyRead = Annotated[User, Depends(require_permission("radiology:read"))]
RequireRadiologyCreate = Annotated[User, Depends(require_permission("radiology:create"))]
RequireRadiologyUpdate = Annotated[User, Depends(require_permission("radiology:update"))]
RequireRadiologyDelete = Annotated[User, Depends(require_permission("radiology:delete"))]
