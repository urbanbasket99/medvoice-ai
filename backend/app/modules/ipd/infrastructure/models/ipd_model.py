from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, Uuid, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class IpdWardModel(Base):
    __tablename__ = "ipd_wards"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    ward_type: Mapped[str] = mapped_column(String(30), nullable=False)
    floor: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IpdBedModel(Base):
    __tablename__ = "ipd_beds"
    __table_args__ = (UniqueConstraint("ward_id", "bed_number", name="uq_ipd_beds_ward_bed_number"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    ward_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("ipd_wards.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    bed_number: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="available", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IpdAdmissionModel(Base):
    __tablename__ = "ipd_admissions"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    admission_number: Mapped[str] = mapped_column(
        String(30), nullable=False, unique=True, index=True
    )
    patient_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    consultation_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True, index=True
    )
    admitting_doctor_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    bed_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("ipd_beds.id", ondelete="SET NULL"), nullable=True, index=True
    )
    admission_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expected_discharge_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    admission_type: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="admitted", index=True)
    chief_complaint: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    discharged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    discharge_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    discharged_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IpdNursingNoteModel(Base):
    __tablename__ = "ipd_nursing_notes"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    admission_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("ipd_admissions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    note_type: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    recorded_by: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IpdOtScheduleModel(Base):
    __tablename__ = "ipd_ot_schedules"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    admission_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("ipd_admissions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    surgery_name: Mapped[str] = mapped_column(String(200), nullable=False)
    surgeon_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False
    )
    theatre: Mapped[str | None] = mapped_column(String(100), nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="scheduled")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IpdMlcCaseModel(Base):
    __tablename__ = "ipd_mlc_cases"
    __table_args__ = (UniqueConstraint("admission_id", name="uq_ipd_mlc_cases_admission_id"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    admission_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("ipd_admissions.id", ondelete="CASCADE"), nullable=False
    )
    police_station: Mapped[str | None] = mapped_column(String(200), nullable=True)
    fir_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    injury_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    incident_datetime: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class IpdChargeModel(Base):
    __tablename__ = "ipd_charges"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    admission_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("ipd_admissions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    charge_type: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    charge_date: Mapped[date] = mapped_column(Date, nullable=False)
    invoice_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
