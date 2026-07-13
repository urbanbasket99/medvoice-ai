"""phase 3a ipd wards beds admissions

Revision ID: 202607121200
Revises: 202607111200
Create Date: 2026-07-12 12:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "202607121200"
down_revision = "202607111200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE SEQUENCE IF NOT EXISTS ipd_admission_number_seq START WITH 1 INCREMENT BY 1"
    )

    op.create_table(
        "ipd_wards",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("ward_type", sa.String(30), nullable=False),
        sa.Column("floor", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("code", name="uq_ipd_wards_code"),
    )
    op.create_index("ix_ipd_wards_code", "ipd_wards", ["code"], unique=True)
    op.create_index("ix_ipd_wards_name", "ipd_wards", ["name"])

    op.create_table(
        "ipd_beds",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "ward_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_wards.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("bed_number", sa.String(30), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="available"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("ward_id", "bed_number", name="uq_ipd_beds_ward_bed_number"),
    )
    op.create_index("ix_ipd_beds_ward_id", "ipd_beds", ["ward_id"])
    op.create_index("ix_ipd_beds_status", "ipd_beds", ["status"])

    op.create_table(
        "ipd_admissions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("admission_number", sa.String(30), nullable=False),
        sa.Column(
            "patient_id",
            UUID(as_uuid=True),
            sa.ForeignKey("patients.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "consultation_id",
            UUID(as_uuid=True),
            sa.ForeignKey("consultations.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "admitting_doctor_id",
            UUID(as_uuid=True),
            sa.ForeignKey("doctors.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "bed_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_beds.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("admission_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expected_discharge_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("admission_type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="admitted"),
        sa.Column("chief_complaint", sa.Text(), nullable=True),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("discharged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("discharge_summary", sa.Text(), nullable=True),
        sa.Column(
            "discharged_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("admission_number", name="uq_ipd_admissions_number"),
    )
    op.create_index("ix_ipd_admissions_number", "ipd_admissions", ["admission_number"], unique=True)
    op.create_index("ix_ipd_admissions_patient_id", "ipd_admissions", ["patient_id"])
    op.create_index("ix_ipd_admissions_consultation_id", "ipd_admissions", ["consultation_id"])
    op.create_index("ix_ipd_admissions_doctor_id", "ipd_admissions", ["admitting_doctor_id"])
    op.create_index("ix_ipd_admissions_bed_id", "ipd_admissions", ["bed_id"])
    op.create_index("ix_ipd_admissions_status", "ipd_admissions", ["status"])


def downgrade() -> None:
    op.drop_index("ix_ipd_admissions_status", table_name="ipd_admissions")
    op.drop_index("ix_ipd_admissions_bed_id", table_name="ipd_admissions")
    op.drop_index("ix_ipd_admissions_doctor_id", table_name="ipd_admissions")
    op.drop_index("ix_ipd_admissions_consultation_id", table_name="ipd_admissions")
    op.drop_index("ix_ipd_admissions_patient_id", table_name="ipd_admissions")
    op.drop_index("ix_ipd_admissions_number", table_name="ipd_admissions")
    op.drop_table("ipd_admissions")

    op.drop_index("ix_ipd_beds_status", table_name="ipd_beds")
    op.drop_index("ix_ipd_beds_ward_id", table_name="ipd_beds")
    op.drop_table("ipd_beds")

    op.drop_index("ix_ipd_wards_name", table_name="ipd_wards")
    op.drop_index("ix_ipd_wards_code", table_name="ipd_wards")
    op.drop_table("ipd_wards")

    op.execute("DROP SEQUENCE IF EXISTS ipd_admission_number_seq")
