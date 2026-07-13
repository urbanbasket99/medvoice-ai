"""phase 2a outpatient gaps: lab results, tpa, medical certs, doctor availability, invoice flags

Revision ID: 202607101200
Revises: 202607072600
Create Date: 2026-07-10 12:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "202607101200"
down_revision = "202607072600"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Lab result fields on order items
    op.add_column("lab_order_items", sa.Column("result_value", sa.String(200), nullable=True))
    op.add_column("lab_order_items", sa.Column("result_unit", sa.String(50), nullable=True))
    op.add_column("lab_order_items", sa.Column("reference_range", sa.String(100), nullable=True))
    op.add_column("lab_order_items", sa.Column("result_flag", sa.String(20), nullable=True))
    op.add_column("lab_order_items", sa.Column("result_notes", sa.Text(), nullable=True))
    op.add_column("lab_order_items", sa.Column("resulted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "lab_order_items",
        sa.Column("resulted_by", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )

    # TPA master
    op.create_table(
        "tpas",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("contact_person", sa.String(150), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("code", name="uq_tpas_code"),
    )
    op.create_index("ix_tpas_name", "tpas", ["name"])

    # Invoice provisional / TPA flags
    op.add_column(
        "invoices",
        sa.Column("is_provisional", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "invoices",
        sa.Column("is_tpa", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "invoices",
        sa.Column("tpa_id", UUID(as_uuid=True), sa.ForeignKey("tpas.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_invoices_tpa_id", "invoices", ["tpa_id"])

    # Insurance claim extras
    op.add_column(
        "insurance_claims",
        sa.Column("tpa_id", UUID(as_uuid=True), sa.ForeignKey("tpas.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column("insurance_claims", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True))

    # Medical certificates
    op.create_table(
        "medical_certificates",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("certificate_number", sa.String(30), nullable=False),
        sa.Column(
            "patient_id",
            UUID(as_uuid=True),
            sa.ForeignKey("patients.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "doctor_id",
            UUID(as_uuid=True),
            sa.ForeignKey("doctors.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "consultation_id",
            UUID(as_uuid=True),
            sa.ForeignKey("consultations.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("certificate_type", sa.String(40), nullable=False),
        sa.Column("issue_date", sa.Date(), nullable=False),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_to", sa.Date(), nullable=True),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("fitness_status", sa.String(40), nullable=True),
        sa.Column("rest_days", sa.Integer(), nullable=True),
        sa.Column(
            "issued_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("certificate_number", name="uq_medical_certificates_number"),
    )
    op.create_index("ix_medical_certificates_patient_id", "medical_certificates", ["patient_id"])
    op.create_index("ix_medical_certificates_doctor_id", "medical_certificates", ["doctor_id"])

    # Doctor availability slots
    op.create_table(
        "doctor_availability_slots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "doctor_id",
            UUID(as_uuid=True),
            sa.ForeignKey("doctors.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("day_of_week", sa.Integer(), nullable=False),  # 0=Mon .. 6=Sun
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("slot_minutes", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("day_of_week >= 0 AND day_of_week <= 6", name="ck_availability_day_of_week"),
        sa.CheckConstraint("start_time < end_time", name="ck_availability_time_range"),
    )
    op.create_index("ix_doctor_availability_slots_doctor_id", "doctor_availability_slots", ["doctor_id"])


def downgrade() -> None:
    op.drop_index("ix_doctor_availability_slots_doctor_id", table_name="doctor_availability_slots")
    op.drop_table("doctor_availability_slots")

    op.drop_index("ix_medical_certificates_doctor_id", table_name="medical_certificates")
    op.drop_index("ix_medical_certificates_patient_id", table_name="medical_certificates")
    op.drop_table("medical_certificates")

    op.drop_column("insurance_claims", "submitted_at")
    op.drop_column("insurance_claims", "tpa_id")

    op.drop_index("ix_invoices_tpa_id", table_name="invoices")
    op.drop_column("invoices", "tpa_id")
    op.drop_column("invoices", "is_tpa")
    op.drop_column("invoices", "is_provisional")

    op.drop_index("ix_tpas_name", table_name="tpas")
    op.drop_table("tpas")

    op.drop_column("lab_order_items", "resulted_by")
    op.drop_column("lab_order_items", "resulted_at")
    op.drop_column("lab_order_items", "result_notes")
    op.drop_column("lab_order_items", "result_flag")
    op.drop_column("lab_order_items", "reference_range")
    op.drop_column("lab_order_items", "result_unit")
    op.drop_column("lab_order_items", "result_value")
