from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MedicalCertificateModel(Base):
    __tablename__ = "medical_certificates"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    certificate_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doctor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    consultation_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True
    )
    certificate_type: Mapped[str] = mapped_column(String(40), nullable=False)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    valid_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    valid_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    fitness_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    rest_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    issued_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
