"""Accounts application service — Phase 4 MVP."""

from dataclasses import dataclass
from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import and_, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.accounts.domain.exceptions import (
    AccountCodeExistsError,
    AccountNotFoundError,
    PaymentExceedsBillBalanceError,
    VendorBillNotFoundError,
    VendorCodeExistsError,
    VendorNotFoundError,
)
from app.modules.accounts.domain.value_objects import AccountType, JournalEntryType, VendorBillStatus
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


@dataclass(slots=True)
class JournalLineData:
    account_id: UUID
    debit: Decimal
    credit: Decimal
    description: str | None = None


class AccountsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def _next_number(self, sequence: str, prefix: str) -> str:
        result = await self._session.execute(text(f"SELECT nextval('{sequence}')"))
        seq = result.scalar_one()
        return f"{prefix}-{seq:06d}"

    async def _get_account(self, account_id: UUID) -> ChartOfAccountModel:
        result = await self._session.execute(
            select(ChartOfAccountModel).where(ChartOfAccountModel.id == account_id)
        )
        account = result.scalar_one_or_none()
        if account is None:
            raise AccountNotFoundError("Account not found.")
        return account

    async def _get_account_by_code(self, code: str) -> ChartOfAccountModel | None:
        result = await self._session.execute(
            select(ChartOfAccountModel).where(ChartOfAccountModel.code == code)
        )
        return result.scalar_one_or_none()

    async def _create_journal(
        self,
        entry_date: date,
        description: str,
        entry_type: JournalEntryType,
        lines: list[JournalLineData],
        created_by: UUID | None = None,
        reference_type: str | None = None,
        reference_id: UUID | None = None,
    ) -> JournalEntryModel:
        total_debit = sum((line.debit for line in lines), Decimal("0"))
        total_credit = sum((line.credit for line in lines), Decimal("0"))
        if total_debit != total_credit:
            raise ValueError("Journal entry must balance.")

        entry = JournalEntryModel(
            id=uuid4(),
            entry_number=await self._next_number("journal_entry_number_seq", "JE"),
            entry_date=entry_date,
            description=description,
            entry_type=entry_type.value,
            reference_type=reference_type,
            reference_id=reference_id,
            created_by=created_by,
        )
        entry.lines = [
            JournalLineModel(
                id=uuid4(),
                journal_entry_id=entry.id,
                account_id=line.account_id,
                debit=line.debit,
                credit=line.credit,
                description=line.description,
            )
            for line in lines
        ]
        self._session.add(entry)
        await self._session.flush()
        return entry

    # --- Chart of accounts ---

    async def list_accounts(self, account_type: AccountType | None = None) -> list[ChartOfAccountModel]:
        stmt = select(ChartOfAccountModel).order_by(ChartOfAccountModel.code)
        if account_type:
            stmt = stmt.where(ChartOfAccountModel.account_type == account_type.value)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def create_account(
        self, code: str, name: str, account_type: AccountType, is_active: bool = True
    ) -> ChartOfAccountModel:
        existing = await self._session.execute(
            select(ChartOfAccountModel.id).where(ChartOfAccountModel.code == code)
        )
        if existing.scalar_one_or_none():
            raise AccountCodeExistsError("Account code already exists.")
        account = ChartOfAccountModel(
            id=uuid4(), code=code, name=name, account_type=account_type.value, is_active=is_active
        )
        self._session.add(account)
        await self._session.flush()
        return account

    async def update_account(
        self, account_id: UUID, name: str, is_active: bool
    ) -> ChartOfAccountModel:
        account = await self._get_account(account_id)
        account.name = name
        account.is_active = is_active
        account.updated_at = datetime.now(UTC)
        await self._session.flush()
        return account

    # --- Vouchers ---

    async def list_expense_vouchers(self) -> list[ExpenseVoucherModel]:
        result = await self._session.execute(
            select(ExpenseVoucherModel).order_by(ExpenseVoucherModel.voucher_date.desc())
        )
        return list(result.scalars().all())

    async def create_expense_voucher(
        self,
        voucher_date: date,
        expense_account_id: UUID,
        payment_account_id: UUID,
        amount: Decimal,
        description: str | None,
        created_by: UUID | None,
    ) -> ExpenseVoucherModel:
        await self._get_account(expense_account_id)
        await self._get_account(payment_account_id)
        entry = await self._create_journal(
            entry_date=voucher_date,
            description=description or "Expense voucher",
            entry_type=JournalEntryType.EXPENSE,
            created_by=created_by,
            lines=[
                JournalLineData(expense_account_id, amount, Decimal("0"), description),
                JournalLineData(payment_account_id, Decimal("0"), amount, description),
            ],
        )
        voucher = ExpenseVoucherModel(
            id=uuid4(),
            voucher_number=await self._next_number("voucher_number_seq", "EXP"),
            voucher_date=voucher_date,
            expense_account_id=expense_account_id,
            payment_account_id=payment_account_id,
            amount=amount,
            description=description,
            journal_entry_id=entry.id,
        )
        self._session.add(voucher)
        await self._session.flush()
        return voucher

    async def list_income_vouchers(self) -> list[IncomeVoucherModel]:
        result = await self._session.execute(
            select(IncomeVoucherModel).order_by(IncomeVoucherModel.voucher_date.desc())
        )
        return list(result.scalars().all())

    async def create_income_voucher(
        self,
        voucher_date: date,
        income_account_id: UUID,
        receipt_account_id: UUID,
        amount: Decimal,
        description: str | None,
        created_by: UUID | None,
    ) -> IncomeVoucherModel:
        await self._get_account(income_account_id)
        await self._get_account(receipt_account_id)
        entry = await self._create_journal(
            entry_date=voucher_date,
            description=description or "Income voucher",
            entry_type=JournalEntryType.INCOME,
            created_by=created_by,
            lines=[
                JournalLineData(receipt_account_id, amount, Decimal("0"), description),
                JournalLineData(income_account_id, Decimal("0"), amount, description),
            ],
        )
        voucher = IncomeVoucherModel(
            id=uuid4(),
            voucher_number=await self._next_number("voucher_number_seq", "INC"),
            voucher_date=voucher_date,
            income_account_id=income_account_id,
            receipt_account_id=receipt_account_id,
            amount=amount,
            description=description,
            journal_entry_id=entry.id,
        )
        self._session.add(voucher)
        await self._session.flush()
        return voucher

    # --- Reports ---

    async def get_cash_book(
        self, date_from: date, date_to: date, account_code: str | None = None
    ) -> list[dict]:
        cash_codes = [account_code] if account_code else ["1000", "1100"]
        accounts = []
        for code in cash_codes:
            acc = await self._get_account_by_code(code)
            if acc:
                accounts.append(acc)
        if not accounts:
            return []

        account_ids = [a.id for a in accounts]
        result = await self._session.execute(
            select(JournalLineModel, JournalEntryModel, ChartOfAccountModel)
            .join(JournalEntryModel, JournalLineModel.journal_entry_id == JournalEntryModel.id)
            .join(ChartOfAccountModel, JournalLineModel.account_id == ChartOfAccountModel.id)
            .where(
                JournalLineModel.account_id.in_(account_ids),
                JournalEntryModel.entry_date >= date_from,
                JournalEntryModel.entry_date <= date_to,
            )
            .order_by(JournalEntryModel.entry_date, JournalEntryModel.entry_number)
        )
        rows = []
        for line, entry, account in result.all():
            rows.append(
                {
                    "entry_date": entry.entry_date,
                    "entry_number": entry.entry_number,
                    "description": entry.description,
                    "account_code": account.code,
                    "account_name": account.name,
                    "debit": line.debit,
                    "credit": line.credit,
                }
            )
        return rows

    async def get_trial_balance(self, as_of: date) -> list[dict]:
        result = await self._session.execute(
            select(
                ChartOfAccountModel.id,
                ChartOfAccountModel.code,
                ChartOfAccountModel.name,
                ChartOfAccountModel.account_type,
                func.coalesce(func.sum(JournalLineModel.debit), 0).label("total_debit"),
                func.coalesce(func.sum(JournalLineModel.credit), 0).label("total_credit"),
            )
            .outerjoin(JournalLineModel, JournalLineModel.account_id == ChartOfAccountModel.id)
            .outerjoin(JournalEntryModel, JournalLineModel.journal_entry_id == JournalEntryModel.id)
            .where(
                ChartOfAccountModel.is_active.is_(True),
                (JournalEntryModel.entry_date.is_(None)) | (JournalEntryModel.entry_date <= as_of),
            )
            .group_by(
                ChartOfAccountModel.id,
                ChartOfAccountModel.code,
                ChartOfAccountModel.name,
                ChartOfAccountModel.account_type,
            )
            .order_by(ChartOfAccountModel.code)
        )
        return [
            {
                "account_id": row.id,
                "code": row.code,
                "name": row.name,
                "account_type": row.account_type,
                "total_debit": row.total_debit,
                "total_credit": row.total_credit,
                "balance": row.total_debit - row.total_credit,
            }
            for row in result.all()
        ]

    # --- AP ---

    async def list_vendors(self) -> list[AccountVendorModel]:
        result = await self._session.execute(
            select(AccountVendorModel).order_by(AccountVendorModel.name)
        )
        return list(result.scalars().all())

    async def create_vendor(
        self, code: str, name: str, contact_person: str | None, phone: str | None, email: str | None
    ) -> AccountVendorModel:
        existing = await self._session.execute(
            select(AccountVendorModel.id).where(AccountVendorModel.code == code)
        )
        if existing.scalar_one_or_none():
            raise VendorCodeExistsError("Vendor code already exists.")
        vendor = AccountVendorModel(
            id=uuid4(),
            code=code,
            name=name,
            contact_person=contact_person,
            phone=phone,
            email=email,
        )
        self._session.add(vendor)
        await self._session.flush()
        return vendor

    async def list_vendor_bills(self, vendor_id: UUID | None = None) -> list[VendorBillModel]:
        stmt = select(VendorBillModel).order_by(VendorBillModel.bill_date.desc())
        if vendor_id:
            stmt = stmt.where(VendorBillModel.vendor_id == vendor_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def create_vendor_bill(
        self,
        vendor_id: UUID,
        bill_date: date,
        due_date: date | None,
        amount: Decimal,
        description: str | None,
        expense_account_id: UUID,
        created_by: UUID | None,
    ) -> VendorBillModel:
        vendor = await self._session.execute(
            select(AccountVendorModel).where(AccountVendorModel.id == vendor_id)
        )
        if vendor.scalar_one_or_none() is None:
            raise VendorNotFoundError("Vendor not found.")

        ap_account = await self._get_account_by_code("2000")
        if ap_account is None:
            raise AccountNotFoundError("Accounts Payable (2000) not found. Run COA seed.")

        await self._get_account(expense_account_id)
        entry = await self._create_journal(
            entry_date=bill_date,
            description=description or f"Vendor bill from {vendor_id}",
            entry_type=JournalEntryType.VENDOR_BILL,
            created_by=created_by,
            lines=[
                JournalLineData(expense_account_id, amount, Decimal("0"), description),
                JournalLineData(ap_account.id, Decimal("0"), amount, description),
            ],
        )
        bill = VendorBillModel(
            id=uuid4(),
            bill_number=await self._next_number("vendor_bill_number_seq", "VB"),
            vendor_id=vendor_id,
            bill_date=bill_date,
            due_date=due_date,
            amount=amount,
            paid_amount=Decimal("0"),
            balance=amount,
            status=VendorBillStatus.OPEN.value,
            description=description,
            journal_entry_id=entry.id,
        )
        self._session.add(bill)
        await self._session.flush()
        return bill

    async def list_vendor_payments(self) -> list[VendorPaymentModel]:
        result = await self._session.execute(
            select(VendorPaymentModel).order_by(VendorPaymentModel.payment_date.desc())
        )
        return list(result.scalars().all())

    async def create_vendor_payment(
        self,
        vendor_bill_id: UUID,
        payment_account_id: UUID,
        amount: Decimal,
        payment_date: date,
        reference_number: str | None,
        created_by: UUID | None,
    ) -> VendorPaymentModel:
        result = await self._session.execute(
            select(VendorBillModel).where(VendorBillModel.id == vendor_bill_id)
        )
        bill = result.scalar_one_or_none()
        if bill is None:
            raise VendorBillNotFoundError("Vendor bill not found.")
        if amount > bill.balance:
            raise PaymentExceedsBillBalanceError("Payment exceeds bill balance.")

        ap_account = await self._get_account_by_code("2000")
        if ap_account is None:
            raise AccountNotFoundError("Accounts Payable (2000) not found.")

        await self._get_account(payment_account_id)
        entry = await self._create_journal(
            entry_date=payment_date,
            description=f"Payment for {bill.bill_number}",
            entry_type=JournalEntryType.VENDOR_PAYMENT,
            created_by=created_by,
            reference_type="vendor_bill",
            reference_id=bill.id,
            lines=[
                JournalLineData(ap_account.id, amount, Decimal("0"), bill.bill_number),
                JournalLineData(payment_account_id, Decimal("0"), amount, bill.bill_number),
            ],
        )
        payment = VendorPaymentModel(
            id=uuid4(),
            payment_number=await self._next_number("ap_payment_number_seq", "AP"),
            vendor_bill_id=vendor_bill_id,
            payment_account_id=payment_account_id,
            amount=amount,
            payment_date=payment_date,
            reference_number=reference_number,
            journal_entry_id=entry.id,
        )
        bill.paid_amount += amount
        bill.balance -= amount
        bill.status = (
            VendorBillStatus.PAID.value
            if bill.balance <= 0
            else VendorBillStatus.PARTIAL.value
        )
        bill.updated_at = datetime.now(UTC)
        self._session.add(payment)
        await self._session.flush()
        return payment

    async def get_ap_outstanding(self) -> list[dict]:
        result = await self._session.execute(
            select(VendorBillModel, AccountVendorModel)
            .join(AccountVendorModel, VendorBillModel.vendor_id == AccountVendorModel.id)
            .where(VendorBillModel.balance > 0)
            .order_by(VendorBillModel.due_date.nulls_last(), VendorBillModel.bill_date)
        )
        return [
            {
                "bill_id": bill.id,
                "bill_number": bill.bill_number,
                "vendor_name": vendor.name,
                "bill_date": bill.bill_date,
                "due_date": bill.due_date,
                "amount": bill.amount,
                "paid_amount": bill.paid_amount,
                "balance": bill.balance,
                "status": bill.status,
            }
            for bill, vendor in result.all()
        ]

    async def list_journal_entries(self, date_from: date | None, date_to: date | None) -> list[JournalEntryModel]:
        stmt = (
            select(JournalEntryModel)
            .options(selectinload(JournalEntryModel.lines))
            .order_by(JournalEntryModel.entry_date.desc(), JournalEntryModel.entry_number.desc())
        )
        if date_from:
            stmt = stmt.where(JournalEntryModel.entry_date >= date_from)
        if date_to:
            stmt = stmt.where(JournalEntryModel.entry_date <= date_to)
        result = await self._session.execute(stmt)
        return list(result.scalars().unique().all())
