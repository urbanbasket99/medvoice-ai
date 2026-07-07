from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PrescriptionModel(Base):
    __tablename__ = "prescriptions"

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
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    advice: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["PrescriptionItemModel"]] = relationship(
        "PrescriptionItemModel",
        back_populates="prescription",
        cascade="all, delete-orphan",
        order_by="PrescriptionItemModel.sort_order",
    )


class PrescriptionItemModel(Base):
    __tablename__ = "prescription_items"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    prescription_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    medicine_master_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("medicine_master.id", ondelete="SET NULL"), nullable=True, index=True
    )
    medicine_name: Mapped[str] = mapped_column(String(200), nullable=False)
    strength: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dosage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    frequency: Mapped[str] = mapped_column(String(20), nullable=False)
    route: Mapped[str] = mapped_column(String(20), nullable=False)
    duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quantity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    morning: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    afternoon: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    night: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    before_food: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    after_food: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    prescription: Mapped[PrescriptionModel] = relationship("PrescriptionModel", back_populates="items")
