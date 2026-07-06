"""create patients table

Revision ID: 202607061200
Revises: 202607060001
Create Date: 2026-07-06

Amended (still pre-release, never applied to a real database — see the
`patients` module's follow-up spec) to the richer schema: `mrn` alongside
`uhid`, expanded personal/contact/address/emergency-contact fields, and
`created_by`/`updated_by` audit columns referencing `users.id`.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202607061200"
down_revision: str | None = "202607060001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Back `SqlAlchemyUhidGenerator` / `SqlAlchemyMrnGenerator` — atomic,
    # collision-free identifier allocation independent of row counts.
    op.execute("CREATE SEQUENCE IF NOT EXISTS patient_uhid_seq START WITH 1 INCREMENT BY 1")
    op.execute("CREATE SEQUENCE IF NOT EXISTS patient_mrn_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "patients",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("mrn", sa.String(length=20), nullable=False),
        sa.Column("uhid", sa.String(length=20), nullable=False),
        # Personal
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("middle_name", sa.String(length=100), nullable=True),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("gender", sa.String(length=10), nullable=False),
        sa.Column("blood_group", sa.String(length=10), nullable=True),
        sa.Column("marital_status", sa.String(length=20), nullable=True),
        sa.Column("occupation", sa.String(length=150), nullable=True),
        # Contact
        sa.Column("mobile", sa.String(length=20), nullable=False),
        sa.Column("alternate_mobile", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        # Address
        sa.Column("address_line1", sa.String(length=255), nullable=True),
        sa.Column("address_line2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("postal_code", sa.String(length=20), nullable=True),
        # Emergency contact
        sa.Column("emergency_name", sa.String(length=150), nullable=True),
        sa.Column("emergency_relation", sa.String(length=50), nullable=True),
        sa.Column("emergency_mobile", sa.String(length=20), nullable=True),
        # Insurance
        sa.Column("insurance_provider", sa.String(length=150), nullable=True),
        sa.Column("insurance_number", sa.String(length=100), nullable=True),
        # Medical
        sa.Column("allergies", sa.Text(), nullable=True),
        sa.Column("chronic_conditions", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        # Administrative
        sa.Column(
            "registration_date", sa.Date(), server_default=sa.func.current_date(), nullable=False
        ),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        # Audit
        sa.Column("created_by", sa.Uuid(), nullable=True),
        sa.Column("updated_by", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_patients"),
        sa.UniqueConstraint("mrn", name="uq_patients_mrn"),
        sa.UniqueConstraint("uhid", name="uq_patients_uhid"),
        sa.ForeignKeyConstraint(
            ["created_by"], ["users.id"], name="fk_patients_created_by_users", ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["updated_by"], ["users.id"], name="fk_patients_updated_by_users", ondelete="SET NULL"
        ),
    )

    op.create_index("ix_patients_mrn", "patients", ["mrn"])
    op.create_index("ix_patients_uhid", "patients", ["uhid"])
    op.create_index("ix_patients_mobile", "patients", ["mobile"])
    op.create_index("ix_patients_email", "patients", ["email"])
    op.create_index("ix_patients_last_name", "patients", ["last_name"])
    op.create_index("ix_patients_status", "patients", ["status"])


def downgrade() -> None:
    op.drop_index("ix_patients_status", table_name="patients")
    op.drop_index("ix_patients_last_name", table_name="patients")
    op.drop_index("ix_patients_email", table_name="patients")
    op.drop_index("ix_patients_mobile", table_name="patients")
    op.drop_index("ix_patients_uhid", table_name="patients")
    op.drop_index("ix_patients_mrn", table_name="patients")
    op.drop_table("patients")
    op.execute("DROP SEQUENCE IF EXISTS patient_mrn_seq")
    op.execute("DROP SEQUENCE IF EXISTS patient_uhid_seq")
