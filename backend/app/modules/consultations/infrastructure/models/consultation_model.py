from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, Time, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ConsultationModel(Base):
    __tablename__ = "consultations"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    visit_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    appointment_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("appointments.id", ondelete="RESTRICT"), nullable=False, unique=True, index=True
    )
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doctor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    chief_complaint: Mapped[str | None] = mapped_column(Text, nullable=True)
    history_of_present_illness: Mapped[str | None] = mapped_column(Text, nullable=True)
    past_medical_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    family_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    allergies: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_medications: Mapped[str | None] = mapped_column(Text, nullable=True)
    vital_signs: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    physical_examination: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    assessment: Mapped[str | None] = mapped_column(Text, nullable=True)
    treatment_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    doctor_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="in_progress", index=True)
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
