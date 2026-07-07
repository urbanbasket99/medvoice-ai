from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InvoiceModel(Base):
    __tablename__ = "invoices"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    invoice_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    consultation_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("consultations.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doctor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    grand_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["InvoiceItemModel"]] = relationship(
        "InvoiceItemModel",
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="InvoiceItemModel.sort_order",
    )
    payments: Mapped[list["PaymentModel"]] = relationship(
        "PaymentModel",
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="PaymentModel.payment_date",
    )
    status_events: Mapped[list["InvoiceStatusEventModel"]] = relationship(
        "InvoiceStatusEventModel",
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="InvoiceStatusEventModel.changed_at",
    )
    insurance_claims: Mapped[list["InsuranceClaimModel"]] = relationship(
        "InsuranceClaimModel",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )


class InvoiceItemModel(Base):
    __tablename__ = "invoice_items"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    invoice_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_name: Mapped[str] = mapped_column(String(200), nullable=False)
    department: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[UUID | None] = mapped_column(Uuid, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

    invoice: Mapped[InvoiceModel] = relationship("InvoiceModel", back_populates="items")


class PaymentModel(Base):
    __tablename__ = "payments"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    invoice_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("invoices.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    payment_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    collected_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    payment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    invoice: Mapped[InvoiceModel] = relationship("InvoiceModel", back_populates="payments")


class InsuranceClaimModel(Base):
    __tablename__ = "insurance_claims"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    invoice_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    claim_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    insurer_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, server_default="pending")
    claimed_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    approved_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    invoice: Mapped[InvoiceModel] = relationship("InvoiceModel", back_populates="insurance_claims")


class InvoiceStatusEventModel(Base):
    __tablename__ = "invoice_status_events"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    invoice_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    invoice: Mapped[InvoiceModel] = relationship("InvoiceModel", back_populates="status_events")
