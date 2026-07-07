from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LabTestMasterModel(Base):
    __tablename__ = "lab_test_master"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    test_code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    test_name: Mapped[str] = mapped_column(String(200), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    sample_type: Mapped[str] = mapped_column(String(20), nullable=False)
    normal_turnaround_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class LabOrderModel(Base):
    __tablename__ = "lab_orders"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    consultation_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("consultations.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doctor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    order_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    clinical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["LabOrderItemModel"]] = relationship(
        "LabOrderItemModel",
        back_populates="lab_order",
        cascade="all, delete-orphan",
        order_by="LabOrderItemModel.sort_order",
    )
    status_history: Mapped[list["LabOrderStatusEventModel"]] = relationship(
        "LabOrderStatusEventModel",
        back_populates="lab_order",
        cascade="all, delete-orphan",
        order_by="LabOrderStatusEventModel.changed_at",
    )


class LabOrderItemModel(Base):
    __tablename__ = "lab_order_items"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    lab_order_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("lab_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lab_test_master_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("lab_test_master.id", ondelete="SET NULL"), nullable=True, index=True
    )
    lab_test_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sample_type: Mapped[str] = mapped_column(String(20), nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, server_default="0")

    lab_order: Mapped[LabOrderModel] = relationship("LabOrderModel", back_populates="items")


class LabOrderStatusEventModel(Base):
    __tablename__ = "lab_order_status_events"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    lab_order_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("lab_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    lab_order: Mapped[LabOrderModel] = relationship("LabOrderModel", back_populates="status_history")
