"""create appointments table

Revision ID: 202607071200
Revises: 202607070800
Create Date: 2026-07-07

Appointments bounded context: links patients and doctors with scheduling
metadata, backed by `appointment_number_seq` for atomic number generation.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202607071200"
down_revision: str | None = "202607070800"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS appointment_number_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "appointments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("appointment_number", sa.String(length=20), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("doctor_id", sa.Uuid(), nullable=False),
        sa.Column("department", sa.String(length=30), nullable=False),
        sa.Column("appointment_date", sa.Date(), nullable=False),
        sa.Column("appointment_time", sa.Time(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("appointment_type", sa.String(length=20), nullable=False, server_default="new"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="normal"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="scheduled"),
        sa.Column("chief_complaint", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("room", sa.String(length=50), nullable=True),
        sa.Column("token_number", sa.Integer(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_appointments"),
        sa.UniqueConstraint("appointment_number", name="uq_appointments_appointment_number"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], name="fk_appointments_patient_id", ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctors.id"], name="fk_appointments_doctor_id", ondelete="RESTRICT"),
    )

    op.create_index("ix_appointments_appointment_number", "appointments", ["appointment_number"])
    op.create_index("ix_appointments_patient_id", "appointments", ["patient_id"])
    op.create_index("ix_appointments_doctor_id", "appointments", ["doctor_id"])
    op.create_index("ix_appointments_department", "appointments", ["department"])
    op.create_index("ix_appointments_appointment_date", "appointments", ["appointment_date"])
    op.create_index("ix_appointments_appointment_type", "appointments", ["appointment_type"])
    op.create_index("ix_appointments_priority", "appointments", ["priority"])
    op.create_index("ix_appointments_status", "appointments", ["status"])


def downgrade() -> None:
    op.drop_index("ix_appointments_status", table_name="appointments")
    op.drop_index("ix_appointments_priority", table_name="appointments")
    op.drop_index("ix_appointments_appointment_type", table_name="appointments")
    op.drop_index("ix_appointments_appointment_date", table_name="appointments")
    op.drop_index("ix_appointments_department", table_name="appointments")
    op.drop_index("ix_appointments_doctor_id", table_name="appointments")
    op.drop_index("ix_appointments_patient_id", table_name="appointments")
    op.drop_index("ix_appointments_appointment_number", table_name="appointments")
    op.drop_table("appointments")
    op.execute("DROP SEQUENCE IF EXISTS appointment_number_seq")
