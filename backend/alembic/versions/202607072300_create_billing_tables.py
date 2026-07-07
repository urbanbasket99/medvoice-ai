"""create billing tables

Revision ID: 202607072300
Revises: 202607072200
Create Date: 2026-07-07 23:00:00.000000

Billing bounded context: invoices, invoice items, payments,
insurance claims, invoice status events.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202607072300"
down_revision: str | None = "202607072200"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "CREATE SEQUENCE IF NOT EXISTS billing_invoice_number_seq START WITH 1 INCREMENT BY 1"
    )
    op.execute(
        "CREATE SEQUENCE IF NOT EXISTS billing_payment_number_seq START WITH 1 INCREMENT BY 1"
    )

    op.create_table(
        "invoices",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_number", sa.String(length=30), nullable=False),
        sa.Column("consultation_id", sa.Uuid(), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("doctor_id", sa.Uuid(), nullable=False),
        sa.Column("invoice_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("discount_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("tax_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("grand_total", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("paid_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("balance", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_invoices"),
        sa.UniqueConstraint("invoice_number", name="uq_invoices_invoice_number"),
        sa.ForeignKeyConstraint(
            ["consultation_id"],
            ["consultations.id"],
            name="fk_invoices_consultation_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["patients.id"],
            name="fk_invoices_patient_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["doctor_id"],
            ["doctors.id"],
            name="fk_invoices_doctor_id",
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_invoices_invoice_number", "invoices", ["invoice_number"])
    op.create_index("ix_invoices_consultation_id", "invoices", ["consultation_id"])
    op.create_index("ix_invoices_patient_id", "invoices", ["patient_id"])
    op.create_index("ix_invoices_doctor_id", "invoices", ["doctor_id"])
    op.create_index("ix_invoices_status", "invoices", ["status"])

    op.create_table(
        "invoice_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("service_name", sa.String(length=200), nullable=False),
        sa.Column("department", sa.String(length=50), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("unit_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("tax_amount", sa.Numeric(12, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("reference_type", sa.String(length=50), nullable=True),
        sa.Column("reference_id", sa.Uuid(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.PrimaryKeyConstraint("id", name="pk_invoice_items"),
        sa.ForeignKeyConstraint(
            ["invoice_id"],
            ["invoices.id"],
            name="fk_invoice_items_invoice_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_invoice_items_invoice_id", "invoice_items", ["invoice_id"])

    op.create_table(
        "payments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("payment_number", sa.String(length=30), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(length=30), nullable=False),
        sa.Column("reference_number", sa.String(length=100), nullable=True),
        sa.Column("collected_by", sa.Uuid(), nullable=True),
        sa.Column("payment_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_payments"),
        sa.UniqueConstraint("payment_number", name="uq_payments_payment_number"),
        sa.ForeignKeyConstraint(
            ["invoice_id"],
            ["invoices.id"],
            name="fk_payments_invoice_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["collected_by"],
            ["users.id"],
            name="fk_payments_collected_by",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_payments_invoice_id", "payments", ["invoice_id"])
    op.create_index("ix_payments_payment_number", "payments", ["payment_number"])
    op.create_index("ix_payments_payment_date", "payments", ["payment_date"])

    op.create_table(
        "insurance_claims",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("claim_number", sa.String(length=50), nullable=True),
        sa.Column("insurer_name", sa.String(length=200), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("claimed_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("approved_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_insurance_claims"),
        sa.ForeignKeyConstraint(
            ["invoice_id"],
            ["invoices.id"],
            name="fk_insurance_claims_invoice_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_insurance_claims_invoice_id", "insurance_claims", ["invoice_id"])

    op.create_table(
        "invoice_status_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("invoice_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_invoice_status_events"),
        sa.ForeignKeyConstraint(
            ["invoice_id"],
            ["invoices.id"],
            name="fk_invoice_status_events_invoice_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_invoice_status_events_invoice_id", "invoice_status_events", ["invoice_id"])


def downgrade() -> None:
    op.drop_index("ix_invoice_status_events_invoice_id", table_name="invoice_status_events")
    op.drop_table("invoice_status_events")
    op.drop_index("ix_insurance_claims_invoice_id", table_name="insurance_claims")
    op.drop_table("insurance_claims")
    op.drop_index("ix_payments_payment_date", table_name="payments")
    op.drop_index("ix_payments_payment_number", table_name="payments")
    op.drop_index("ix_payments_invoice_id", table_name="payments")
    op.drop_table("payments")
    op.drop_index("ix_invoice_items_invoice_id", table_name="invoice_items")
    op.drop_table("invoice_items")
    op.drop_index("ix_invoices_status", table_name="invoices")
    op.drop_index("ix_invoices_doctor_id", table_name="invoices")
    op.drop_index("ix_invoices_patient_id", table_name="invoices")
    op.drop_index("ix_invoices_consultation_id", table_name="invoices")
    op.drop_index("ix_invoices_invoice_number", table_name="invoices")
    op.drop_table("invoices")
    op.execute("DROP SEQUENCE IF EXISTS billing_payment_number_seq")
    op.execute("DROP SEQUENCE IF EXISTS billing_invoice_number_seq")
