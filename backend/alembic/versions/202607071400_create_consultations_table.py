"""create consultations table

Revision ID: 202607071400
Revises: 202607071200
Create Date: 2026-07-07

Consultations bounded context: clinical encounter records linked to
appointments, patients, and doctors.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "202607071400"
down_revision: str | None = "202607071200"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS consultation_visit_number_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "consultations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("visit_number", sa.String(length=20), nullable=False),
        sa.Column("appointment_id", sa.Uuid(), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("doctor_id", sa.Uuid(), nullable=False),
        sa.Column("chief_complaint", sa.Text(), nullable=True),
        sa.Column("history_of_present_illness", sa.Text(), nullable=True),
        sa.Column("past_medical_history", sa.Text(), nullable=True),
        sa.Column("family_history", sa.Text(), nullable=True),
        sa.Column("allergies", sa.Text(), nullable=True),
        sa.Column("current_medications", sa.Text(), nullable=True),
        sa.Column("vital_signs", JSONB(), nullable=True),
        sa.Column("physical_examination", sa.Text(), nullable=True),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("assessment", sa.Text(), nullable=True),
        sa.Column("treatment_plan", sa.Text(), nullable=True),
        sa.Column("doctor_notes", sa.Text(), nullable=True),
        sa.Column("follow_up_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="in_progress"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_consultations"),
        sa.UniqueConstraint("visit_number", name="uq_consultations_visit_number"),
        sa.UniqueConstraint("appointment_id", name="uq_consultations_appointment_id"),
        sa.ForeignKeyConstraint(
            ["appointment_id"], ["appointments.id"], name="fk_consultations_appointment_id", ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["patient_id"], ["patients.id"], name="fk_consultations_patient_id", ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["doctor_id"], ["doctors.id"], name="fk_consultations_doctor_id", ondelete="RESTRICT"
        ),
    )

    op.create_index("ix_consultations_visit_number", "consultations", ["visit_number"])
    op.create_index("ix_consultations_appointment_id", "consultations", ["appointment_id"])
    op.create_index("ix_consultations_patient_id", "consultations", ["patient_id"])
    op.create_index("ix_consultations_doctor_id", "consultations", ["doctor_id"])
    op.create_index("ix_consultations_status", "consultations", ["status"])


def downgrade() -> None:
    op.drop_index("ix_consultations_status", table_name="consultations")
    op.drop_index("ix_consultations_doctor_id", table_name="consultations")
    op.drop_index("ix_consultations_patient_id", table_name="consultations")
    op.drop_index("ix_consultations_appointment_id", table_name="consultations")
    op.drop_index("ix_consultations_visit_number", table_name="consultations")
    op.drop_table("consultations")
    op.execute("DROP SEQUENCE IF EXISTS consultation_visit_number_seq")
