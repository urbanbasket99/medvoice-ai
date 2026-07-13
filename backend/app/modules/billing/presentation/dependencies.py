from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.billing.application.interfaces.consultation_charge_lookup import ConsultationChargeLookup
from app.modules.billing.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.billing.application.interfaces.invoice_number_generator import InvoiceNumberGenerator
from app.modules.billing.application.interfaces.payment_number_generator import PaymentNumberGenerator
from app.modules.billing.application.use_cases.create_claim import CreateClaimUseCase
from app.modules.billing.application.use_cases.create_invoice import CreateInvoiceUseCase
from app.modules.billing.application.use_cases.create_payment import CreatePaymentUseCase
from app.modules.billing.application.use_cases.create_tpa import CreateTpaUseCase
from app.modules.billing.application.use_cases.delete_invoice import DeleteInvoiceUseCase
from app.modules.billing.application.use_cases.get_collection_report import GetCollectionReportUseCase
from app.modules.billing.application.use_cases.get_consultation_charges import GetConsultationChargesUseCase
from app.modules.billing.application.use_cases.get_invoice import GetInvoiceUseCase
from app.modules.billing.application.use_cases.get_invoice_print import GetInvoicePrintUseCase
from app.modules.billing.application.use_cases.get_invoices import GetInvoicesUseCase
from app.modules.billing.application.use_cases.get_outstanding_invoices import GetOutstandingInvoicesUseCase
from app.modules.billing.application.use_cases.get_payment import GetPaymentUseCase
from app.modules.billing.application.use_cases.get_payment_print import GetPaymentPrintUseCase
from app.modules.billing.application.use_cases.get_payments import GetPaymentsUseCase
from app.modules.billing.application.use_cases.get_tpa import GetTpaUseCase
from app.modules.billing.application.use_cases.issue_invoice import IssueInvoiceUseCase
from app.modules.billing.application.use_cases.list_claims_by_invoice import ListClaimsByInvoiceUseCase
from app.modules.billing.application.use_cases.list_tpas import ListTpasUseCase
from app.modules.billing.application.use_cases.search_invoices import SearchInvoicesUseCase
from app.modules.billing.application.use_cases.update_claim import UpdateClaimUseCase
from app.modules.billing.application.use_cases.update_invoice import UpdateInvoiceUseCase
from app.modules.billing.application.use_cases.update_tpa import UpdateTpaUseCase
from app.modules.billing.domain.repositories.insurance_claim_repository import InsuranceClaimRepository
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.repositories.payment_repository import PaymentRepository
from app.modules.billing.domain.repositories.tpa_repository import TpaRepository
from app.modules.billing.infrastructure.invoice_number_generator import SqlAlchemyInvoiceNumberGenerator
from app.modules.billing.infrastructure.payment_number_generator import SqlAlchemyPaymentNumberGenerator
from app.modules.billing.infrastructure.repositories.consultation_charge_lookup import (
    SqlAlchemyConsultationChargeLookup,
)
from app.modules.billing.infrastructure.repositories.consultation_lookup import SqlAlchemyConsultationLookup
from app.modules.billing.infrastructure.repositories.sqlalchemy_insurance_claim_repository import (
    SqlAlchemyInsuranceClaimRepository,
)
from app.modules.billing.infrastructure.repositories.sqlalchemy_invoice_repository import (
    SqlAlchemyInvoiceRepository,
)
from app.modules.billing.infrastructure.repositories.sqlalchemy_payment_repository import (
    SqlAlchemyPaymentRepository,
)
from app.modules.billing.infrastructure.repositories.sqlalchemy_tpa_repository import (
    SqlAlchemyTpaRepository,
)


def get_invoice_repository(db: DbSession) -> InvoiceRepository:
    return SqlAlchemyInvoiceRepository(db)


def get_payment_repository(db: DbSession) -> PaymentRepository:
    return SqlAlchemyPaymentRepository(db)


def get_tpa_repository(db: DbSession) -> TpaRepository:
    return SqlAlchemyTpaRepository(db)


def get_insurance_claim_repository(db: DbSession) -> InsuranceClaimRepository:
    return SqlAlchemyInsuranceClaimRepository(db)


def get_consultation_lookup(db: DbSession) -> ConsultationLookup:
    return SqlAlchemyConsultationLookup(db)


def get_consultation_charge_lookup(db: DbSession) -> ConsultationChargeLookup:
    return SqlAlchemyConsultationChargeLookup(db)


def get_invoice_number_generator(db: DbSession) -> InvoiceNumberGenerator:
    return SqlAlchemyInvoiceNumberGenerator(db)


def get_payment_number_generator(db: DbSession) -> PaymentNumberGenerator:
    return SqlAlchemyPaymentNumberGenerator(db)


InvoiceRepositoryDep = Annotated[InvoiceRepository, Depends(get_invoice_repository)]
PaymentRepositoryDep = Annotated[PaymentRepository, Depends(get_payment_repository)]
TpaRepositoryDep = Annotated[TpaRepository, Depends(get_tpa_repository)]
InsuranceClaimRepositoryDep = Annotated[
    InsuranceClaimRepository, Depends(get_insurance_claim_repository)
]
ConsultationLookupDep = Annotated[ConsultationLookup, Depends(get_consultation_lookup)]
ConsultationChargeLookupDep = Annotated[ConsultationChargeLookup, Depends(get_consultation_charge_lookup)]
InvoiceNumberGeneratorDep = Annotated[InvoiceNumberGenerator, Depends(get_invoice_number_generator)]
PaymentNumberGeneratorDep = Annotated[PaymentNumberGenerator, Depends(get_payment_number_generator)]


def provide_create_invoice_use_case(
    invoice_repository: InvoiceRepositoryDep,
    consultation_lookup: ConsultationLookupDep,
    invoice_number_generator: InvoiceNumberGeneratorDep,
) -> CreateInvoiceUseCase:
    return CreateInvoiceUseCase(invoice_repository, consultation_lookup, invoice_number_generator)


def provide_update_invoice_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> UpdateInvoiceUseCase:
    return UpdateInvoiceUseCase(invoice_repository)


def provide_delete_invoice_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> DeleteInvoiceUseCase:
    return DeleteInvoiceUseCase(invoice_repository)


def provide_get_invoice_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> GetInvoiceUseCase:
    return GetInvoiceUseCase(invoice_repository)


def provide_get_invoices_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> GetInvoicesUseCase:
    return GetInvoicesUseCase(invoice_repository)


def provide_search_invoices_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> SearchInvoicesUseCase:
    return SearchInvoicesUseCase(invoice_repository)


def provide_get_outstanding_invoices_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> GetOutstandingInvoicesUseCase:
    return GetOutstandingInvoicesUseCase(invoice_repository)


def provide_get_invoice_print_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> GetInvoicePrintUseCase:
    return GetInvoicePrintUseCase(invoice_repository)


def provide_get_consultation_charges_use_case(
    charge_lookup: ConsultationChargeLookupDep,
) -> GetConsultationChargesUseCase:
    return GetConsultationChargesUseCase(charge_lookup)


def provide_create_payment_use_case(
    invoice_repository: InvoiceRepositoryDep,
    payment_repository: PaymentRepositoryDep,
    payment_number_generator: PaymentNumberGeneratorDep,
) -> CreatePaymentUseCase:
    return CreatePaymentUseCase(invoice_repository, payment_repository, payment_number_generator)


def provide_get_payment_use_case(
    payment_repository: PaymentRepositoryDep,
) -> GetPaymentUseCase:
    return GetPaymentUseCase(payment_repository)


def provide_get_payments_use_case(
    payment_repository: PaymentRepositoryDep,
) -> GetPaymentsUseCase:
    return GetPaymentsUseCase(payment_repository)


def provide_issue_invoice_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> IssueInvoiceUseCase:
    return IssueInvoiceUseCase(invoice_repository)


def provide_get_payment_print_use_case(
    payment_repository: PaymentRepositoryDep,
    invoice_repository: InvoiceRepositoryDep,
) -> GetPaymentPrintUseCase:
    return GetPaymentPrintUseCase(payment_repository, invoice_repository)


def provide_create_tpa_use_case(tpa_repository: TpaRepositoryDep) -> CreateTpaUseCase:
    return CreateTpaUseCase(tpa_repository)


def provide_update_tpa_use_case(tpa_repository: TpaRepositoryDep) -> UpdateTpaUseCase:
    return UpdateTpaUseCase(tpa_repository)


def provide_get_tpa_use_case(tpa_repository: TpaRepositoryDep) -> GetTpaUseCase:
    return GetTpaUseCase(tpa_repository)


def provide_list_tpas_use_case(tpa_repository: TpaRepositoryDep) -> ListTpasUseCase:
    return ListTpasUseCase(tpa_repository)


def provide_create_claim_use_case(
    claim_repository: InsuranceClaimRepositoryDep,
    invoice_repository: InvoiceRepositoryDep,
) -> CreateClaimUseCase:
    return CreateClaimUseCase(claim_repository, invoice_repository)


def provide_update_claim_use_case(
    claim_repository: InsuranceClaimRepositoryDep,
) -> UpdateClaimUseCase:
    return UpdateClaimUseCase(claim_repository)


def provide_list_claims_by_invoice_use_case(
    claim_repository: InsuranceClaimRepositoryDep,
    invoice_repository: InvoiceRepositoryDep,
) -> ListClaimsByInvoiceUseCase:
    return ListClaimsByInvoiceUseCase(claim_repository, invoice_repository)


def provide_get_collection_report_use_case(
    invoice_repository: InvoiceRepositoryDep,
) -> GetCollectionReportUseCase:
    return GetCollectionReportUseCase(invoice_repository)


CreateInvoiceUseCaseDep = Annotated[CreateInvoiceUseCase, Depends(provide_create_invoice_use_case)]
UpdateInvoiceUseCaseDep = Annotated[UpdateInvoiceUseCase, Depends(provide_update_invoice_use_case)]
DeleteInvoiceUseCaseDep = Annotated[DeleteInvoiceUseCase, Depends(provide_delete_invoice_use_case)]
GetInvoiceUseCaseDep = Annotated[GetInvoiceUseCase, Depends(provide_get_invoice_use_case)]
GetInvoicesUseCaseDep = Annotated[GetInvoicesUseCase, Depends(provide_get_invoices_use_case)]
SearchInvoicesUseCaseDep = Annotated[SearchInvoicesUseCase, Depends(provide_search_invoices_use_case)]
GetOutstandingInvoicesUseCaseDep = Annotated[
    GetOutstandingInvoicesUseCase, Depends(provide_get_outstanding_invoices_use_case)
]
GetInvoicePrintUseCaseDep = Annotated[GetInvoicePrintUseCase, Depends(provide_get_invoice_print_use_case)]
GetConsultationChargesUseCaseDep = Annotated[
    GetConsultationChargesUseCase, Depends(provide_get_consultation_charges_use_case)
]
CreatePaymentUseCaseDep = Annotated[CreatePaymentUseCase, Depends(provide_create_payment_use_case)]
GetPaymentUseCaseDep = Annotated[GetPaymentUseCase, Depends(provide_get_payment_use_case)]
GetPaymentsUseCaseDep = Annotated[GetPaymentsUseCase, Depends(provide_get_payments_use_case)]
IssueInvoiceUseCaseDep = Annotated[IssueInvoiceUseCase, Depends(provide_issue_invoice_use_case)]
GetPaymentPrintUseCaseDep = Annotated[GetPaymentPrintUseCase, Depends(provide_get_payment_print_use_case)]
CreateTpaUseCaseDep = Annotated[CreateTpaUseCase, Depends(provide_create_tpa_use_case)]
UpdateTpaUseCaseDep = Annotated[UpdateTpaUseCase, Depends(provide_update_tpa_use_case)]
GetTpaUseCaseDep = Annotated[GetTpaUseCase, Depends(provide_get_tpa_use_case)]
ListTpasUseCaseDep = Annotated[ListTpasUseCase, Depends(provide_list_tpas_use_case)]
CreateClaimUseCaseDep = Annotated[CreateClaimUseCase, Depends(provide_create_claim_use_case)]
UpdateClaimUseCaseDep = Annotated[UpdateClaimUseCase, Depends(provide_update_claim_use_case)]
ListClaimsByInvoiceUseCaseDep = Annotated[
    ListClaimsByInvoiceUseCase, Depends(provide_list_claims_by_invoice_use_case)
]
GetCollectionReportUseCaseDep = Annotated[
    GetCollectionReportUseCase, Depends(provide_get_collection_report_use_case)
]

RequireBillingRead = Annotated[User, Depends(require_permission("billing:read"))]
RequireBillingCreate = Annotated[User, Depends(require_permission("billing:create"))]
RequireBillingUpdate = Annotated[User, Depends(require_permission("billing:update"))]
RequireBillingDelete = Annotated[User, Depends(require_permission("billing:delete"))]
