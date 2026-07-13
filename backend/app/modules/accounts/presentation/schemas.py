from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.accounts.domain.value_objects import AccountType
from app.modules.accounts.infrastructure.models.accounts_model import (
    AccountVendorModel,
    ChartOfAccountModel,
    ExpenseVoucherModel,
    IncomeVoucherModel,
    JournalEntryModel,
    JournalLineModel,
    VendorBillModel,
    VendorPaymentModel,
)


class AccountCreateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=200)
    account_type: AccountType
    is_active: bool = True


class AccountUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    is_active: bool = True


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    account_type: AccountType
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: ChartOfAccountModel) -> "AccountResponse":
        return cls(
            id=model.id,
            code=model.code,
            name=model.name,
            account_type=AccountType(model.account_type),
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class AccountListResponse(BaseModel):
    items: list[AccountResponse]


class ExpenseVoucherCreateRequest(BaseModel):
    voucher_date: date
    expense_account_id: UUID
    payment_account_id: UUID
    amount: Decimal = Field(gt=0)
    description: str | None = None


class IncomeVoucherCreateRequest(BaseModel):
    voucher_date: date
    income_account_id: UUID
    receipt_account_id: UUID
    amount: Decimal = Field(gt=0)
    description: str | None = None


class VoucherResponse(BaseModel):
    id: UUID
    voucher_number: str
    voucher_date: date
    amount: Decimal
    description: str | None
    created_at: datetime


class ExpenseVoucherResponse(VoucherResponse):
    expense_account_id: UUID
    payment_account_id: UUID

    @classmethod
    def from_model(cls, model: ExpenseVoucherModel) -> "ExpenseVoucherResponse":
        return cls(
            id=model.id,
            voucher_number=model.voucher_number,
            voucher_date=model.voucher_date,
            amount=model.amount,
            description=model.description,
            created_at=model.created_at,
            expense_account_id=model.expense_account_id,
            payment_account_id=model.payment_account_id,
        )


class IncomeVoucherResponse(VoucherResponse):
    income_account_id: UUID
    receipt_account_id: UUID

    @classmethod
    def from_model(cls, model: IncomeVoucherModel) -> "IncomeVoucherResponse":
        return cls(
            id=model.id,
            voucher_number=model.voucher_number,
            voucher_date=model.voucher_date,
            amount=model.amount,
            description=model.description,
            created_at=model.created_at,
            income_account_id=model.income_account_id,
            receipt_account_id=model.receipt_account_id,
        )


class CashBookRowResponse(BaseModel):
    entry_date: date
    entry_number: str
    description: str
    account_code: str
    account_name: str
    debit: Decimal
    credit: Decimal


class CashBookResponse(BaseModel):
    items: list[CashBookRowResponse]
    date_from: date
    date_to: date


class TrialBalanceRowResponse(BaseModel):
    account_id: UUID
    code: str
    name: str
    account_type: str
    total_debit: Decimal
    total_credit: Decimal
    balance: Decimal


class TrialBalanceResponse(BaseModel):
    as_of: date
    items: list[TrialBalanceRowResponse]


class VendorCreateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=200)
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    contact_person: str | None
    phone: str | None
    email: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, model: AccountVendorModel) -> "VendorResponse":
        return cls.model_validate(model)


class VendorBillCreateRequest(BaseModel):
    vendor_id: UUID
    bill_date: date
    due_date: date | None = None
    amount: Decimal = Field(gt=0)
    description: str | None = None
    expense_account_id: UUID


class VendorBillResponse(BaseModel):
    id: UUID
    bill_number: str
    vendor_id: UUID
    bill_date: date
    due_date: date | None
    amount: Decimal
    paid_amount: Decimal
    balance: Decimal
    status: str
    description: str | None
    created_at: datetime

    @classmethod
    def from_model(cls, model: VendorBillModel) -> "VendorBillResponse":
        return cls.model_validate(model)


class VendorPaymentCreateRequest(BaseModel):
    vendor_bill_id: UUID
    payment_account_id: UUID
    amount: Decimal = Field(gt=0)
    payment_date: date
    reference_number: str | None = None


class VendorPaymentResponse(BaseModel):
    id: UUID
    payment_number: str
    vendor_bill_id: UUID
    payment_account_id: UUID
    amount: Decimal
    payment_date: date
    reference_number: str | None
    created_at: datetime

    @classmethod
    def from_model(cls, model: VendorPaymentModel) -> "VendorPaymentResponse":
        return cls.model_validate(model)


class ApOutstandingRowResponse(BaseModel):
    bill_id: UUID
    bill_number: str
    vendor_name: str
    bill_date: date
    due_date: date | None
    amount: Decimal
    paid_amount: Decimal
    balance: Decimal
    status: str


class ApOutstandingResponse(BaseModel):
    items: list[ApOutstandingRowResponse]


class JournalLineResponse(BaseModel):
    id: UUID
    account_id: UUID
    debit: Decimal
    credit: Decimal
    description: str | None

    @classmethod
    def from_model(cls, model: JournalLineModel) -> "JournalLineResponse":
        return cls.model_validate(model)


class JournalEntryResponse(BaseModel):
    id: UUID
    entry_number: str
    entry_date: date
    description: str
    entry_type: str
    lines: list[JournalLineResponse]
    created_at: datetime

    @classmethod
    def from_model(cls, model: JournalEntryModel) -> "JournalEntryResponse":
        return cls(
            id=model.id,
            entry_number=model.entry_number,
            entry_date=model.entry_date,
            description=model.description,
            entry_type=model.entry_type,
            lines=[JournalLineResponse.from_model(line) for line in model.lines],
            created_at=model.created_at,
        )
