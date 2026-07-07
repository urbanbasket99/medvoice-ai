"""create doctors table

Revision ID: 202607070800
Revises: 202607061200
Create Date: 2026-07-07

Doctors bounded context (see app/modules/doctors): doctor identity,
professional, and contact fields, backed by a Postgres sequence
(`doctor_code_seq`) for atomic, collision-free `doctor_code` generation —
mirrors the Patients module's `patient_uhid_seq`/`patient_mrn_seq`.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202607070800"
down_revision: str | None = "202607061200"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Backs `SqlAlchemyDoctorCodeGenerator` — atomic, collision-free
    # identifier allocation independent of row counts.
    op.execute("CREATE SEQUENCE IF NOT EXISTS doctor_code_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "doctors",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("doctor_code", sa.String(length=20), nullable=False),
        # Personal / Professional
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("gender", sa.String(length=10), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("department", sa.String(length=30), nullable=False),
        sa.Column("specialization", sa.String(length=150), nullable=False),
        sa.Column("qualification", sa.String(length=255), nullable=False),
        sa.Column("registration_number", sa.String(length=100), nullable=False),
        sa.Column("experience_years", sa.Integer(), nullable=False, server_default="0"),
        # Contact
        sa.Column("mobile", sa.String(length=20), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        # Professional details
        sa.Column("languages_spoken", postgresql.ARRAY(sa.String(length=50)), nullable=True),
        sa.Column("consultation_fee", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("working_hours", sa.String(length=255), nullable=True),
        sa.Column("photo_url", sa.String(length=500), nullable=True),
        # Administrative
        sa.Column(
            "joining_date", sa.Date(), server_default=sa.func.current_date(), nullable=False
        ),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_doctors"),
        sa.UniqueConstraint("doctor_code", name="uq_doctors_doctor_code"),
        sa.UniqueConstraint("registration_number", name="uq_doctors_registration_number"),
    )

    op.create_index("ix_doctors_doctor_code", "doctors", ["doctor_code"])
    op.create_index("ix_doctors_registration_number", "doctors", ["registration_number"])
    op.create_index("ix_doctors_mobile", "doctors", ["mobile"])
    op.create_index("ix_doctors_email", "doctors", ["email"])
    op.create_index("ix_doctors_full_name", "doctors", ["full_name"])
    op.create_index("ix_doctors_department", "doctors", ["department"])
    op.create_index("ix_doctors_status", "doctors", ["status"])


def downgrade() -> None:
    op.drop_index("ix_doctors_status", table_name="doctors")
    op.drop_index("ix_doctors_department", table_name="doctors")
    op.drop_index("ix_doctors_full_name", table_name="doctors")
    op.drop_index("ix_doctors_email", table_name="doctors")
    op.drop_index("ix_doctors_mobile", table_name="doctors")
    op.drop_index("ix_doctors_registration_number", table_name="doctors")
    op.drop_index("ix_doctors_doctor_code", table_name="doctors")
    op.drop_table("doctors")
    op.execute("DROP SEQUENCE IF EXISTS doctor_code_seq")
