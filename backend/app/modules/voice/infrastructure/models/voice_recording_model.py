from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VoiceRecordingModel(Base):
    __tablename__ = "voice_recordings"

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
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    storage_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    audio_format: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="recording", index=True)
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
