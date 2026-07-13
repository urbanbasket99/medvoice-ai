from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PharmacySupplierModel(Base):
    __tablename__ = "pharmacy_suppliers"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    code: Mapped[str | None] = mapped_column(String(30), nullable=True, unique=True, index=True)
    contact_person: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class PharmacyMedicineModel(Base):
    __tablename__ = "pharmacy_medicines"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    medicine_code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    generic_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    brand_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    strength: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dosage_form: Mapped[str | None] = mapped_column(String(50), nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String(200), nullable=True)
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    mrp: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    gst: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, server_default="0")
    barcode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    stock: Mapped["PharmacyMedicineStockModel | None"] = relationship(
        "PharmacyMedicineStockModel",
        back_populates="medicine",
        uselist=False,
    )
    batches: Mapped[list["PharmacyBatchModel"]] = relationship(
        "PharmacyBatchModel",
        back_populates="medicine",
        order_by="PharmacyBatchModel.expiry_date",
    )


class PharmacyBatchModel(Base):
    __tablename__ = "pharmacy_batches"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    medicine_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("pharmacy_medicines.id", ondelete="CASCADE"), nullable=False, index=True
    )
    batch_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    supplier_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("pharmacy_suppliers.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    medicine: Mapped[PharmacyMedicineModel] = relationship("PharmacyMedicineModel", back_populates="batches")
    supplier: Mapped[PharmacySupplierModel | None] = relationship("PharmacySupplierModel")


class PharmacyMedicineStockModel(Base):
    __tablename__ = "pharmacy_medicine_stock"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    medicine_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("pharmacy_medicines.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    current_stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    reserved_stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    minimum_stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    maximum_stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    medicine: Mapped[PharmacyMedicineModel] = relationship("PharmacyMedicineModel", back_populates="stock")


class DispenseRecordModel(Base):
    __tablename__ = "dispense_records"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    dispense_type: Mapped[str] = mapped_column(String(20), nullable=False, server_default="prescription")
    prescription_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("prescriptions.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    consultation_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("consultations.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doctor_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    dispensed_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    dispensed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    order_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)

    items: Mapped[list["DispenseItemModel"]] = relationship(
        "DispenseItemModel",
        back_populates="dispense",
        cascade="all, delete-orphan",
        order_by="DispenseItemModel.sort_order",
    )
    status_history: Mapped[list["DispenseStatusEventModel"]] = relationship(
        "DispenseStatusEventModel",
        back_populates="dispense",
        cascade="all, delete-orphan",
        order_by="DispenseStatusEventModel.changed_at",
    )


class DispenseItemModel(Base):
    __tablename__ = "dispense_items"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    dispense_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("dispense_records.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prescription_item_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("prescription_items.id", ondelete="SET NULL"), nullable=True
    )
    medicine_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("pharmacy_medicines.id", ondelete="SET NULL"), nullable=True, index=True
    )
    batch_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("pharmacy_batches.id", ondelete="SET NULL"), nullable=True
    )
    medicine_name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")

    dispense: Mapped[DispenseRecordModel] = relationship("DispenseRecordModel", back_populates="items")


class DispenseStatusEventModel(Base):
    __tablename__ = "dispense_status_events"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    dispense_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("dispense_records.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    dispense: Mapped[DispenseRecordModel] = relationship("DispenseRecordModel", back_populates="status_history")


class StockMovementModel(Base):
    __tablename__ = "stock_movements"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    medicine_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("pharmacy_medicines.id", ondelete="CASCADE"), nullable=False, index=True
    )
    batch_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("pharmacy_batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    quantity_delta: Mapped[int] = mapped_column(Integer, nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[UUID | None] = mapped_column(Uuid, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    medicine: Mapped[PharmacyMedicineModel] = relationship("PharmacyMedicineModel")
    batch: Mapped[PharmacyBatchModel | None] = relationship("PharmacyBatchModel")


class VendorPaymentModel(Base):
    __tablename__ = "pharmacy_vendor_payments"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    payment_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    supplier_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("pharmacy_suppliers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False, server_default="cash")
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    supplier: Mapped[PharmacySupplierModel] = relationship("PharmacySupplierModel")
