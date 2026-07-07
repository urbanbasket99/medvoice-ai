from datetime import date, datetime, time
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Time, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AppointmentModel(Base):
    __tablename__ = "appointments"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    appointment_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doctor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    department: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    appointment_time: Mapped[time] = mapped_column(Time, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    appointment_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="normal", index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled", index=True)
    chief_complaint: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    room: Mapped[str | None] = mapped_column(String(50), nullable=True)
    token_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
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
