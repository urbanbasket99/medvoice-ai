from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RadiologyTestMasterModel(Base):
    __tablename__ = "radiology_test_master"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    test_code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    test_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    body_part: Mapped[str] = mapped_column(String(100), nullable=False)
    estimated_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class RadiologyOrderModel(Base):
    __tablename__ = "radiology_orders"

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

    items: Mapped[list["RadiologyOrderItemModel"]] = relationship(
        "RadiologyOrderItemModel",
        back_populates="radiology_order",
        cascade="all, delete-orphan",
        order_by="RadiologyOrderItemModel.sort_order",
    )
    status_history: Mapped[list["RadiologyOrderStatusEventModel"]] = relationship(
        "RadiologyOrderStatusEventModel",
        back_populates="radiology_order",
        cascade="all, delete-orphan",
        order_by="RadiologyOrderStatusEventModel.changed_at",
    )


class RadiologyOrderItemModel(Base):
    __tablename__ = "radiology_order_items"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    radiology_order_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("radiology_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    radiology_test_master_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("radiology_test_master.id", ondelete="SET NULL"), nullable=True, index=True
    )
    test_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    body_part: Mapped[str] = mapped_column(String(100), nullable=False)
    contrast_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, server_default="0")

    radiology_order: Mapped[RadiologyOrderModel] = relationship(
        "RadiologyOrderModel", back_populates="items"
    )


class RadiologyOrderStatusEventModel(Base):
    __tablename__ = "radiology_order_status_events"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    radiology_order_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("radiology_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    radiology_order: Mapped[RadiologyOrderModel] = relationship(
        "RadiologyOrderModel", back_populates="status_history"
    )
