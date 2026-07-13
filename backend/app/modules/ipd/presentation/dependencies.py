from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.ipd.application.interfaces.admission_number_generator import (
    AdmissionNumberGenerator,
)
from app.modules.ipd.application.use_cases.cancel_admission import CancelAdmissionUseCase
from app.modules.ipd.application.use_cases.create_admission import CreateAdmissionUseCase
from app.modules.ipd.application.use_cases.create_bed import CreateBedUseCase
from app.modules.ipd.application.use_cases.create_ward import CreateWardUseCase
from app.modules.ipd.application.use_cases.delete_bed import DeleteBedUseCase
from app.modules.ipd.application.use_cases.delete_ward import DeleteWardUseCase
from app.modules.ipd.application.use_cases.discharge_admission import DischargeAdmissionUseCase
from app.modules.ipd.application.use_cases.get_admission import GetAdmissionUseCase
from app.modules.ipd.application.use_cases.get_admissions import GetAdmissionsUseCase
from app.modules.ipd.application.use_cases.get_bed import GetBedUseCase
from app.modules.ipd.application.use_cases.get_beds import GetBedsUseCase
from app.modules.ipd.application.use_cases.get_ward import GetWardUseCase
from app.modules.ipd.application.use_cases.get_wards import GetWardsUseCase
from app.modules.ipd.application.use_cases.list_available_beds import ListAvailableBedsUseCase
from app.modules.ipd.application.use_cases.update_admission import UpdateAdmissionUseCase
from app.modules.ipd.application.use_cases.update_bed import UpdateBedUseCase
from app.modules.ipd.application.use_cases.update_ward import UpdateWardUseCase
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.infrastructure.invoice_number_generator import SqlAlchemyInvoiceNumberGenerator
from app.modules.billing.infrastructure.repositories.sqlalchemy_invoice_repository import (
    SqlAlchemyInvoiceRepository,
)
from app.modules.ipd.application.use_cases.admission_charges import (
    CreateAdmissionChargeUseCase,
    GenerateAdmissionInvoiceUseCase,
    ListAdmissionChargesUseCase,
)
from app.modules.ipd.application.use_cases.create_admission_from_consultation import (
    CreateAdmissionFromConsultationUseCase,
)
from app.modules.ipd.application.use_cases.mlc_cases import GetMlcCaseUseCase, UpsertMlcCaseUseCase
from app.modules.ipd.application.use_cases.nursing_notes import (
    CreateNursingNoteUseCase,
    DeleteNursingNoteUseCase,
    ListNursingNotesUseCase,
)
from app.modules.ipd.application.use_cases.ot_schedules import (
    CreateOtScheduleUseCase,
    ListOtSchedulesUseCase,
    UpdateOtScheduleUseCase,
)
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository
from app.modules.ipd.infrastructure.repositories.sqlalchemy_clinical_repository import (
    SqlAlchemyClinicalRepository,
)
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.repositories.bed_repository import BedRepository
from app.modules.ipd.domain.repositories.ward_repository import WardRepository
from app.modules.ipd.infrastructure.admission_number_generator import (
    SqlAlchemyAdmissionNumberGenerator,
)
from app.modules.ipd.infrastructure.repositories.sqlalchemy_admission_repository import (
    SqlAlchemyAdmissionRepository,
)
from app.modules.ipd.infrastructure.repositories.sqlalchemy_bed_repository import SqlAlchemyBedRepository
from app.modules.ipd.infrastructure.repositories.sqlalchemy_ward_repository import (
    SqlAlchemyWardRepository,
)


def get_ward_repository(db: DbSession) -> WardRepository:
    return SqlAlchemyWardRepository(db)


def get_bed_repository(db: DbSession) -> BedRepository:
    return SqlAlchemyBedRepository(db)


def get_admission_repository(db: DbSession) -> AdmissionRepository:
    return SqlAlchemyAdmissionRepository(db)


def get_admission_number_generator(db: DbSession) -> AdmissionNumberGenerator:
    return SqlAlchemyAdmissionNumberGenerator(db)


def get_clinical_repository(db: DbSession) -> ClinicalRepository:
    return SqlAlchemyClinicalRepository(db)


def get_invoice_repository(db: DbSession) -> InvoiceRepository:
    return SqlAlchemyInvoiceRepository(db)


def get_invoice_number_generator(db: DbSession):
    return SqlAlchemyInvoiceNumberGenerator(db)


WardRepositoryDep = Annotated[WardRepository, Depends(get_ward_repository)]
BedRepositoryDep = Annotated[BedRepository, Depends(get_bed_repository)]
AdmissionRepositoryDep = Annotated[AdmissionRepository, Depends(get_admission_repository)]
ClinicalRepositoryDep = Annotated[ClinicalRepository, Depends(get_clinical_repository)]
InvoiceRepositoryDep = Annotated[InvoiceRepository, Depends(get_invoice_repository)]
InvoiceNumberGeneratorDep = Annotated[object, Depends(get_invoice_number_generator)]
AdmissionNumberGeneratorDep = Annotated[
    AdmissionNumberGenerator, Depends(get_admission_number_generator)
]


def provide_create_ward_use_case(ward_repository: WardRepositoryDep) -> CreateWardUseCase:
    return CreateWardUseCase(ward_repository)


def provide_update_ward_use_case(ward_repository: WardRepositoryDep) -> UpdateWardUseCase:
    return UpdateWardUseCase(ward_repository)


def provide_delete_ward_use_case(ward_repository: WardRepositoryDep) -> DeleteWardUseCase:
    return DeleteWardUseCase(ward_repository)


def provide_get_ward_use_case(ward_repository: WardRepositoryDep) -> GetWardUseCase:
    return GetWardUseCase(ward_repository)


def provide_get_wards_use_case(ward_repository: WardRepositoryDep) -> GetWardsUseCase:
    return GetWardsUseCase(ward_repository)


def provide_create_bed_use_case(bed_repository: BedRepositoryDep) -> CreateBedUseCase:
    return CreateBedUseCase(bed_repository)


def provide_update_bed_use_case(bed_repository: BedRepositoryDep) -> UpdateBedUseCase:
    return UpdateBedUseCase(bed_repository)


def provide_delete_bed_use_case(bed_repository: BedRepositoryDep) -> DeleteBedUseCase:
    return DeleteBedUseCase(bed_repository)


def provide_get_bed_use_case(bed_repository: BedRepositoryDep) -> GetBedUseCase:
    return GetBedUseCase(bed_repository)


def provide_get_beds_use_case(bed_repository: BedRepositoryDep) -> GetBedsUseCase:
    return GetBedsUseCase(bed_repository)


def provide_list_available_beds_use_case(
    bed_repository: BedRepositoryDep,
) -> ListAvailableBedsUseCase:
    return ListAvailableBedsUseCase(bed_repository)


def provide_create_admission_use_case(
    admission_repository: AdmissionRepositoryDep,
    bed_repository: BedRepositoryDep,
    number_generator: AdmissionNumberGeneratorDep,
) -> CreateAdmissionUseCase:
    return CreateAdmissionUseCase(admission_repository, bed_repository, number_generator)


def provide_get_admission_use_case(
    admission_repository: AdmissionRepositoryDep,
) -> GetAdmissionUseCase:
    return GetAdmissionUseCase(admission_repository)


def provide_get_admissions_use_case(
    admission_repository: AdmissionRepositoryDep,
) -> GetAdmissionsUseCase:
    return GetAdmissionsUseCase(admission_repository)


def provide_update_admission_use_case(
    admission_repository: AdmissionRepositoryDep,
    bed_repository: BedRepositoryDep,
) -> UpdateAdmissionUseCase:
    return UpdateAdmissionUseCase(admission_repository, bed_repository)


def provide_discharge_admission_use_case(
    admission_repository: AdmissionRepositoryDep,
    bed_repository: BedRepositoryDep,
) -> DischargeAdmissionUseCase:
    return DischargeAdmissionUseCase(admission_repository, bed_repository)


def provide_cancel_admission_use_case(
    admission_repository: AdmissionRepositoryDep,
    bed_repository: BedRepositoryDep,
) -> CancelAdmissionUseCase:
    return CancelAdmissionUseCase(admission_repository, bed_repository)


def provide_create_admission_from_consultation_use_case(
    clinical_repository: ClinicalRepositoryDep,
    create_admission_use_case: CreateAdmissionUseCaseDep,
) -> CreateAdmissionFromConsultationUseCase:
    return CreateAdmissionFromConsultationUseCase(clinical_repository, create_admission_use_case)


def provide_list_nursing_notes_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> ListNursingNotesUseCase:
    return ListNursingNotesUseCase(clinical_repository)


def provide_create_nursing_note_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> CreateNursingNoteUseCase:
    return CreateNursingNoteUseCase(clinical_repository)


def provide_delete_nursing_note_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> DeleteNursingNoteUseCase:
    return DeleteNursingNoteUseCase(clinical_repository)


def provide_list_ot_schedules_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> ListOtSchedulesUseCase:
    return ListOtSchedulesUseCase(clinical_repository)


def provide_create_ot_schedule_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> CreateOtScheduleUseCase:
    return CreateOtScheduleUseCase(clinical_repository)


def provide_update_ot_schedule_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> UpdateOtScheduleUseCase:
    return UpdateOtScheduleUseCase(clinical_repository)


def provide_get_mlc_case_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> GetMlcCaseUseCase:
    return GetMlcCaseUseCase(clinical_repository)


def provide_upsert_mlc_case_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> UpsertMlcCaseUseCase:
    return UpsertMlcCaseUseCase(clinical_repository)


def provide_list_admission_charges_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> ListAdmissionChargesUseCase:
    return ListAdmissionChargesUseCase(clinical_repository)


def provide_create_admission_charge_use_case(
    clinical_repository: ClinicalRepositoryDep,
) -> CreateAdmissionChargeUseCase:
    return CreateAdmissionChargeUseCase(clinical_repository)


def provide_generate_admission_invoice_use_case(
    clinical_repository: ClinicalRepositoryDep,
    admission_repository: AdmissionRepositoryDep,
    invoice_repository: InvoiceRepositoryDep,
    invoice_number_generator: InvoiceNumberGeneratorDep,
) -> GenerateAdmissionInvoiceUseCase:
    return GenerateAdmissionInvoiceUseCase(
        clinical_repository,
        admission_repository,
        invoice_repository,
        invoice_number_generator,
    )


CreateWardUseCaseDep = Annotated[CreateWardUseCase, Depends(provide_create_ward_use_case)]
UpdateWardUseCaseDep = Annotated[UpdateWardUseCase, Depends(provide_update_ward_use_case)]
DeleteWardUseCaseDep = Annotated[DeleteWardUseCase, Depends(provide_delete_ward_use_case)]
GetWardUseCaseDep = Annotated[GetWardUseCase, Depends(provide_get_ward_use_case)]
GetWardsUseCaseDep = Annotated[GetWardsUseCase, Depends(provide_get_wards_use_case)]
CreateBedUseCaseDep = Annotated[CreateBedUseCase, Depends(provide_create_bed_use_case)]
UpdateBedUseCaseDep = Annotated[UpdateBedUseCase, Depends(provide_update_bed_use_case)]
DeleteBedUseCaseDep = Annotated[DeleteBedUseCase, Depends(provide_delete_bed_use_case)]
GetBedUseCaseDep = Annotated[GetBedUseCase, Depends(provide_get_bed_use_case)]
GetBedsUseCaseDep = Annotated[GetBedsUseCase, Depends(provide_get_beds_use_case)]
ListAvailableBedsUseCaseDep = Annotated[
    ListAvailableBedsUseCase, Depends(provide_list_available_beds_use_case)
]
CreateAdmissionUseCaseDep = Annotated[
    CreateAdmissionUseCase, Depends(provide_create_admission_use_case)
]
GetAdmissionUseCaseDep = Annotated[GetAdmissionUseCase, Depends(provide_get_admission_use_case)]
GetAdmissionsUseCaseDep = Annotated[GetAdmissionsUseCase, Depends(provide_get_admissions_use_case)]
UpdateAdmissionUseCaseDep = Annotated[
    UpdateAdmissionUseCase, Depends(provide_update_admission_use_case)
]
DischargeAdmissionUseCaseDep = Annotated[
    DischargeAdmissionUseCase, Depends(provide_discharge_admission_use_case)
]
CancelAdmissionUseCaseDep = Annotated[
    CancelAdmissionUseCase, Depends(provide_cancel_admission_use_case)
]
CreateAdmissionFromConsultationUseCaseDep = Annotated[
    CreateAdmissionFromConsultationUseCase,
    Depends(provide_create_admission_from_consultation_use_case),
]
ListNursingNotesUseCaseDep = Annotated[
    ListNursingNotesUseCase, Depends(provide_list_nursing_notes_use_case)
]
CreateNursingNoteUseCaseDep = Annotated[
    CreateNursingNoteUseCase, Depends(provide_create_nursing_note_use_case)
]
DeleteNursingNoteUseCaseDep = Annotated[
    DeleteNursingNoteUseCase, Depends(provide_delete_nursing_note_use_case)
]
ListOtSchedulesUseCaseDep = Annotated[
    ListOtSchedulesUseCase, Depends(provide_list_ot_schedules_use_case)
]
CreateOtScheduleUseCaseDep = Annotated[
    CreateOtScheduleUseCase, Depends(provide_create_ot_schedule_use_case)
]
UpdateOtScheduleUseCaseDep = Annotated[
    UpdateOtScheduleUseCase, Depends(provide_update_ot_schedule_use_case)
]
GetMlcCaseUseCaseDep = Annotated[GetMlcCaseUseCase, Depends(provide_get_mlc_case_use_case)]
UpsertMlcCaseUseCaseDep = Annotated[UpsertMlcCaseUseCase, Depends(provide_upsert_mlc_case_use_case)]
ListAdmissionChargesUseCaseDep = Annotated[
    ListAdmissionChargesUseCase, Depends(provide_list_admission_charges_use_case)
]
CreateAdmissionChargeUseCaseDep = Annotated[
    CreateAdmissionChargeUseCase, Depends(provide_create_admission_charge_use_case)
]
GenerateAdmissionInvoiceUseCaseDep = Annotated[
    GenerateAdmissionInvoiceUseCase, Depends(provide_generate_admission_invoice_use_case)
]

RequireIpdRead = Annotated[User, Depends(require_permission("ipd:read"))]
RequireIpdCreate = Annotated[User, Depends(require_permission("ipd:create"))]
RequireIpdUpdate = Annotated[User, Depends(require_permission("ipd:update"))]
RequireIpdDelete = Annotated[User, Depends(require_permission("ipd:delete"))]
