from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.accounts.application.accounts_service import AccountsService
from app.modules.accounts.domain.value_objects import AccountType
from app.modules.accounts.presentation.dependencies import AccountsServiceDep, RequireAccountsCreate, RequireAccountsRead
from app.modules.accounts.presentation.schemas import (
    AccountCreateRequest,
    AccountListResponse,
    AccountResponse,
    AccountUpdateRequest,
    ApOutstandingResponse,
    ApOutstandingRowResponse,
    CashBookResponse,
    CashBookRowResponse,
    ExpenseVoucherCreateRequest,
    ExpenseVoucherResponse,
    IncomeVoucherCreateRequest,
    IncomeVoucherResponse,
    JournalEntryResponse,
    TrialBalanceResponse,
    TrialBalanceRowResponse,
    VendorBillCreateRequest,
    VendorBillResponse,
    VendorCreateRequest,
    VendorPaymentCreateRequest,
    VendorPaymentResponse,
    VendorResponse,
)

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/chart", response_model=AccountListResponse)
async def list_accounts(
    _: RequireAccountsRead,
    service: AccountsServiceDep,
    account_type: AccountType | None = None,
) -> AccountListResponse:
    accounts = await service.list_accounts(account_type)
    return AccountListResponse(items=[AccountResponse.from_model(a) for a in accounts])


@router.post("/chart", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    payload: AccountCreateRequest,
    _: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> AccountResponse:
    account = await service.create_account(payload.code, payload.name, payload.account_type, payload.is_active)
    return AccountResponse.from_model(account)


@router.put("/chart/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: UUID,
    payload: AccountUpdateRequest,
    _: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> AccountResponse:
    account = await service.update_account(account_id, payload.name, payload.is_active)
    return AccountResponse.from_model(account)


@router.get("/expenses", response_model=list[ExpenseVoucherResponse])
async def list_expense_vouchers(_: RequireAccountsRead, service: AccountsServiceDep) -> list[ExpenseVoucherResponse]:
    vouchers = await service.list_expense_vouchers()
    return [ExpenseVoucherResponse.from_model(v) for v in vouchers]


@router.post("/expenses", response_model=ExpenseVoucherResponse, status_code=status.HTTP_201_CREATED)
async def create_expense_voucher(
    payload: ExpenseVoucherCreateRequest,
    current_user: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> ExpenseVoucherResponse:
    voucher = await service.create_expense_voucher(
        payload.voucher_date,
        payload.expense_account_id,
        payload.payment_account_id,
        payload.amount,
        payload.description,
        current_user.id,
    )
    return ExpenseVoucherResponse.from_model(voucher)


@router.get("/income", response_model=list[IncomeVoucherResponse])
async def list_income_vouchers(_: RequireAccountsRead, service: AccountsServiceDep) -> list[IncomeVoucherResponse]:
    vouchers = await service.list_income_vouchers()
    return [IncomeVoucherResponse.from_model(v) for v in vouchers]


@router.post("/income", response_model=IncomeVoucherResponse, status_code=status.HTTP_201_CREATED)
async def create_income_voucher(
    payload: IncomeVoucherCreateRequest,
    current_user: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> IncomeVoucherResponse:
    voucher = await service.create_income_voucher(
        payload.voucher_date,
        payload.income_account_id,
        payload.receipt_account_id,
        payload.amount,
        payload.description,
        current_user.id,
    )
    return IncomeVoucherResponse.from_model(voucher)


@router.get("/cash-book", response_model=CashBookResponse)
async def get_cash_book(
    _: RequireAccountsRead,
    service: AccountsServiceDep,
    date_from: Annotated[date, Query()],
    date_to: Annotated[date, Query()],
    account_code: str | None = None,
) -> CashBookResponse:
    rows = await service.get_cash_book(date_from, date_to, account_code)
    return CashBookResponse(
        date_from=date_from,
        date_to=date_to,
        items=[CashBookRowResponse(**row) for row in rows],
    )


@router.get("/trial-balance", response_model=TrialBalanceResponse)
async def get_trial_balance(
    _: RequireAccountsRead,
    service: AccountsServiceDep,
    as_of: Annotated[date, Query()],
) -> TrialBalanceResponse:
    rows = await service.get_trial_balance(as_of)
    return TrialBalanceResponse(
        as_of=as_of,
        items=[TrialBalanceRowResponse(**row) for row in rows],
    )


@router.get("/journal-entries", response_model=list[JournalEntryResponse])
async def list_journal_entries(
    _: RequireAccountsRead,
    service: AccountsServiceDep,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[JournalEntryResponse]:
    entries = await service.list_journal_entries(date_from, date_to)
    return [JournalEntryResponse.from_model(e) for e in entries]


@router.get("/vendors", response_model=list[VendorResponse])
async def list_vendors(_: RequireAccountsRead, service: AccountsServiceDep) -> list[VendorResponse]:
    vendors = await service.list_vendors()
    return [VendorResponse.from_model(v) for v in vendors]


@router.post("/vendors", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    payload: VendorCreateRequest,
    _: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> VendorResponse:
    vendor = await service.create_vendor(
        payload.code, payload.name, payload.contact_person, payload.phone, payload.email
    )
    return VendorResponse.from_model(vendor)


@router.get("/vendor-bills", response_model=list[VendorBillResponse])
async def list_vendor_bills(
    _: RequireAccountsRead,
    service: AccountsServiceDep,
    vendor_id: UUID | None = None,
) -> list[VendorBillResponse]:
    bills = await service.list_vendor_bills(vendor_id)
    return [VendorBillResponse.from_model(b) for b in bills]


@router.post("/vendor-bills", response_model=VendorBillResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor_bill(
    payload: VendorBillCreateRequest,
    current_user: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> VendorBillResponse:
    bill = await service.create_vendor_bill(
        payload.vendor_id,
        payload.bill_date,
        payload.due_date,
        payload.amount,
        payload.description,
        payload.expense_account_id,
        current_user.id,
    )
    return VendorBillResponse.from_model(bill)


@router.get("/vendor-payments", response_model=list[VendorPaymentResponse])
async def list_vendor_payments(_: RequireAccountsRead, service: AccountsServiceDep) -> list[VendorPaymentResponse]:
    payments = await service.list_vendor_payments()
    return [VendorPaymentResponse.from_model(p) for p in payments]


@router.post("/vendor-payments", response_model=VendorPaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor_payment(
    payload: VendorPaymentCreateRequest,
    current_user: RequireAccountsCreate,
    service: AccountsServiceDep,
) -> VendorPaymentResponse:
    payment = await service.create_vendor_payment(
        payload.vendor_bill_id,
        payload.payment_account_id,
        payload.amount,
        payload.payment_date,
        payload.reference_number,
        current_user.id,
    )
    return VendorPaymentResponse.from_model(payment)


@router.get("/ap-outstanding", response_model=ApOutstandingResponse)
async def get_ap_outstanding(_: RequireAccountsRead, service: AccountsServiceDep) -> ApOutstandingResponse:
    rows = await service.get_ap_outstanding()
    return ApOutstandingResponse(items=[ApOutstandingRowResponse(**row) for row in rows])
