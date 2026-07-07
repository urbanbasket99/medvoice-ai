from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.prescriptions.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.prescriptions.application.use_cases.create_prescription import CreatePrescriptionUseCase
from app.modules.prescriptions.application.use_cases.delete_prescription import DeletePrescriptionUseCase
from app.modules.prescriptions.application.use_cases.export_prescription_pdf import ExportPrescriptionPdfUseCase
from app.modules.prescriptions.application.use_cases.get_prescription import GetPrescriptionUseCase
from app.modules.prescriptions.application.use_cases.get_prescription_print import GetPrescriptionPrintUseCase
from app.modules.prescriptions.application.use_cases.get_prescriptions import GetPrescriptionsUseCase
from app.modules.prescriptions.application.use_cases.search_medicines import SearchMedicinesUseCase
from app.modules.prescriptions.application.use_cases.search_prescriptions import SearchPrescriptionsUseCase
from app.modules.prescriptions.application.use_cases.update_prescription import UpdatePrescriptionUseCase
from app.modules.prescriptions.domain.repositories.medicine_master_repository import MedicineMasterRepository
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.prescriptions.infrastructure.repositories.consultation_lookup import SqlAlchemyConsultationLookup
from app.modules.prescriptions.infrastructure.repositories.sqlalchemy_medicine_master_repository import (
    SqlAlchemyMedicineMasterRepository,
)
from app.modules.prescriptions.infrastructure.repositories.sqlalchemy_prescription_repository import (
    SqlAlchemyPrescriptionRepository,
)


def get_prescription_repository(db: DbSession) -> PrescriptionRepository:
    return SqlAlchemyPrescriptionRepository(db)


def get_medicine_master_repository(db: DbSession) -> MedicineMasterRepository:
    return SqlAlchemyMedicineMasterRepository(db)


def get_consultation_lookup(db: DbSession) -> ConsultationLookup:
    return SqlAlchemyConsultationLookup(db)


PrescriptionRepositoryDep = Annotated[PrescriptionRepository, Depends(get_prescription_repository)]
MedicineMasterRepositoryDep = Annotated[MedicineMasterRepository, Depends(get_medicine_master_repository)]
ConsultationLookupDep = Annotated[ConsultationLookup, Depends(get_consultation_lookup)]


def provide_create_prescription_use_case(
    prescription_repository: PrescriptionRepositoryDep,
    consultation_lookup: ConsultationLookupDep,
) -> CreatePrescriptionUseCase:
    return CreatePrescriptionUseCase(prescription_repository, consultation_lookup)


def provide_update_prescription_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> UpdatePrescriptionUseCase:
    return UpdatePrescriptionUseCase(prescription_repository)


def provide_delete_prescription_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> DeletePrescriptionUseCase:
    return DeletePrescriptionUseCase(prescription_repository)


def provide_get_prescription_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> GetPrescriptionUseCase:
    return GetPrescriptionUseCase(prescription_repository)


def provide_get_prescriptions_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> GetPrescriptionsUseCase:
    return GetPrescriptionsUseCase(prescription_repository)


def provide_search_prescriptions_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> SearchPrescriptionsUseCase:
    return SearchPrescriptionsUseCase(prescription_repository)


def provide_search_medicines_use_case(
    medicine_repository: MedicineMasterRepositoryDep,
) -> SearchMedicinesUseCase:
    return SearchMedicinesUseCase(medicine_repository)


def provide_get_prescription_print_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> GetPrescriptionPrintUseCase:
    return GetPrescriptionPrintUseCase(prescription_repository)


def provide_export_prescription_pdf_use_case(
    prescription_repository: PrescriptionRepositoryDep,
) -> ExportPrescriptionPdfUseCase:
    return ExportPrescriptionPdfUseCase(prescription_repository)


CreatePrescriptionUseCaseDep = Annotated[
    CreatePrescriptionUseCase, Depends(provide_create_prescription_use_case)
]
UpdatePrescriptionUseCaseDep = Annotated[
    UpdatePrescriptionUseCase, Depends(provide_update_prescription_use_case)
]
DeletePrescriptionUseCaseDep = Annotated[
    DeletePrescriptionUseCase, Depends(provide_delete_prescription_use_case)
]
GetPrescriptionUseCaseDep = Annotated[GetPrescriptionUseCase, Depends(provide_get_prescription_use_case)]
GetPrescriptionsUseCaseDep = Annotated[
    GetPrescriptionsUseCase, Depends(provide_get_prescriptions_use_case)
]
SearchPrescriptionsUseCaseDep = Annotated[
    SearchPrescriptionsUseCase, Depends(provide_search_prescriptions_use_case)
]
SearchMedicinesUseCaseDep = Annotated[SearchMedicinesUseCase, Depends(provide_search_medicines_use_case)]
GetPrescriptionPrintUseCaseDep = Annotated[
    GetPrescriptionPrintUseCase, Depends(provide_get_prescription_print_use_case)
]
ExportPrescriptionPdfUseCaseDep = Annotated[
    ExportPrescriptionPdfUseCase, Depends(provide_export_prescription_pdf_use_case)
]

RequirePrescriptionsRead = Annotated[User, Depends(require_permission("prescriptions:read"))]
RequirePrescriptionsCreate = Annotated[User, Depends(require_permission("prescriptions:create"))]
RequirePrescriptionsUpdate = Annotated[User, Depends(require_permission("prescriptions:update"))]
RequirePrescriptionsDelete = Annotated[User, Depends(require_permission("prescriptions:delete"))]
