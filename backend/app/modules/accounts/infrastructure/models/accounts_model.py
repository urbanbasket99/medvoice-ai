from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Uuid, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChartOfAccountModel(Base):
    __tablename__ = "chart_of_accounts"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_type: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class JournalEntryModel(Base):
    __tablename__ = "journal_entries"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    entry_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(300), nullable=False)
    entry_type: Mapped[str] = mapped_column(String(30), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    reference_id: Mapped[UUID | None] = mapped_column(Uuid, nullable=True)
    created_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    lines: Mapped[list["JournalLineModel"]] = relationship(
        "JournalLineModel", back_populates="entry", cascade="all, delete-orphan"
    )


class JournalLineModel(Base):
    __tablename__ = "journal_lines"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    journal_entry_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    account_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    debit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    credit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    entry: Mapped[JournalEntryModel] = relationship("JournalEntryModel", back_populates="lines")


class ExpenseVoucherModel(Base):
    __tablename__ = "expense_vouchers"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    voucher_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    voucher_date: Mapped[date] = mapped_column(Date, nullable=False)
    expense_account_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False
    )
    payment_account_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    journal_entry_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("journal_entries.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class IncomeVoucherModel(Base):
    __tablename__ = "income_vouchers"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    voucher_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    voucher_date: Mapped[date] = mapped_column(Date, nullable=False)
    income_account_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False
    )
    receipt_account_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    journal_entry_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("journal_entries.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class AccountVendorModel(Base):
    __tablename__ = "account_vendors"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(150), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class VendorBillModel(Base):
    __tablename__ = "vendor_bills"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    bill_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    vendor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("account_vendors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    bill_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="open")
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    journal_entry_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("journal_entries.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class VendorPaymentModel(Base):
    __tablename__ = "vendor_payments"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    payment_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    vendor_bill_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("vendor_bills.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    payment_account_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    journal_entry_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("journal_entries.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
