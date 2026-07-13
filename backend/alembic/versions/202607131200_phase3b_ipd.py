"""phase 3b ipd nursing ot mlc charges billing

Revision ID: 202607131200
Revises: 202607121200
Create Date: 2026-07-13 12:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "202607131200"
down_revision = "202607121200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ipd_nursing_notes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "admission_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_admissions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("note_type", sa.String(50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "recorded_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_ipd_nursing_notes_admission_id", "ipd_nursing_notes", ["admission_id"])

    op.create_table(
        "ipd_ot_schedules",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "admission_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_admissions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("surgery_name", sa.String(200), nullable=False),
        sa.Column(
            "surgeon_id",
            UUID(as_uuid=True),
            sa.ForeignKey("doctors.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("theatre", sa.String(100), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="scheduled"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_ipd_ot_schedules_admission_id", "ipd_ot_schedules", ["admission_id"])

    op.create_table(
        "ipd_mlc_cases",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "admission_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_admissions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("police_station", sa.String(200), nullable=True),
        sa.Column("fir_number", sa.String(100), nullable=True),
        sa.Column("injury_details", sa.Text(), nullable=True),
        sa.Column("incident_datetime", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("admission_id", name="uq_ipd_mlc_cases_admission_id"),
    )

    op.add_column(
        "invoices",
        sa.Column(
            "admission_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_admissions.id", ondelete="RESTRICT"),
            nullable=True,
        ),
    )
    op.create_index("ix_invoices_admission_id", "invoices", ["admission_id"])
    op.alter_column("invoices", "consultation_id", existing_type=UUID(as_uuid=True), nullable=True)

    op.create_table(
        "ipd_charges",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "admission_id",
            UUID(as_uuid=True),
            sa.ForeignKey("ipd_admissions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("charge_type", sa.String(30), nullable=False),
        sa.Column("description", sa.String(200), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("charge_date", sa.Date(), nullable=False),
        sa.Column(
            "invoice_id",
            UUID(as_uuid=True),
            sa.ForeignKey("invoices.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ipd_charges_admission_id", "ipd_charges", ["admission_id"])
    op.create_index("ix_ipd_charges_invoice_id", "ipd_charges", ["invoice_id"])


def downgrade() -> None:
    op.drop_table("ipd_charges")
    op.alter_column("invoices", "consultation_id", existing_type=UUID(as_uuid=True), nullable=False)
    op.drop_index("ix_invoices_admission_id", table_name="invoices")
    op.drop_column("invoices", "admission_id")
    op.drop_table("ipd_mlc_cases")
    op.drop_index("ix_ipd_ot_schedules_admission_id", table_name="ipd_ot_schedules")
    op.drop_table("ipd_ot_schedules")
    op.drop_index("ix_ipd_nursing_notes_admission_id", table_name="ipd_nursing_notes")
    op.drop_table("ipd_nursing_notes")
