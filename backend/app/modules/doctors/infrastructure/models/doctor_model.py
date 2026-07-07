from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, Integer, Numeric, String, Text, Uuid, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DoctorModel(Base):
    __tablename__ = "doctors"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    doctor_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    department: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    specialization: Mapped[str] = mapped_column(String(150), nullable=False)
    qualification: Mapped[str] = mapped_column(String(255), nullable=False)
    registration_number: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    languages_spoken: Mapped[list[str] | None] = mapped_column(ARRAY(String(50)), nullable=True)
    consultation_fee: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    working_hours: Mapped[str | None] = mapped_column(String(255), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    joining_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=func.current_date())
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)
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
