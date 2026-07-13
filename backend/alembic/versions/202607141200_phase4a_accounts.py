"""phase 4a accounts finance

Revision ID: 202607141200
Revises: 202607131200
Create Date: 2026-07-14 12:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "202607141200"
down_revision = "202607131200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS journal_entry_number_seq START WITH 1 INCREMENT BY 1")
    op.execute("CREATE SEQUENCE IF NOT EXISTS voucher_number_seq START WITH 1 INCREMENT BY 1")
    op.execute("CREATE SEQUENCE IF NOT EXISTS vendor_bill_number_seq START WITH 1 INCREMENT BY 1")
    op.execute("CREATE SEQUENCE IF NOT EXISTS ap_payment_number_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "chart_of_accounts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(20), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("account_type", sa.String(20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("code", name="uq_chart_of_accounts_code"),
    )
    op.create_index("ix_chart_of_accounts_code", "chart_of_accounts", ["code"], unique=True)

    op.create_table(
        "journal_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("entry_number", sa.String(30), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("description", sa.String(300), nullable=False),
        sa.Column("entry_type", sa.String(30), nullable=False),
        sa.Column("reference_type", sa.String(30), nullable=True),
        sa.Column("reference_id", UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("entry_number", name="uq_journal_entries_entry_number"),
    )
    op.create_index("ix_journal_entries_entry_date", "journal_entries", ["entry_date"])

    op.create_table(
        "journal_lines",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "journal_entry_id",
            UUID(as_uuid=True),
            sa.ForeignKey("journal_entries.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "account_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("debit", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("credit", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("description", sa.String(200), nullable=True),
    )
    op.create_index("ix_journal_lines_journal_entry_id", "journal_lines", ["journal_entry_id"])
    op.create_index("ix_journal_lines_account_id", "journal_lines", ["account_id"])

    op.create_table(
        "expense_vouchers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("voucher_number", sa.String(30), nullable=False),
        sa.Column("voucher_date", sa.Date(), nullable=False),
        sa.Column(
            "expense_account_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "payment_account_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("description", sa.String(300), nullable=True),
        sa.Column(
            "journal_entry_id",
            UUID(as_uuid=True),
            sa.ForeignKey("journal_entries.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("voucher_number", name="uq_expense_vouchers_voucher_number"),
    )

    op.create_table(
        "income_vouchers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("voucher_number", sa.String(30), nullable=False),
        sa.Column("voucher_date", sa.Date(), nullable=False),
        sa.Column(
            "income_account_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "receipt_account_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("description", sa.String(300), nullable=True),
        sa.Column(
            "journal_entry_id",
            UUID(as_uuid=True),
            sa.ForeignKey("journal_entries.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("voucher_number", name="uq_income_vouchers_voucher_number"),
    )

    op.create_table(
        "account_vendors",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("contact_person", sa.String(150), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("code", name="uq_account_vendors_code"),
    )

    op.create_table(
        "vendor_bills",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("bill_number", sa.String(30), nullable=False),
        sa.Column(
            "vendor_id",
            UUID(as_uuid=True),
            sa.ForeignKey("account_vendors.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("bill_date", sa.Date(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("paid_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("balance", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("description", sa.String(300), nullable=True),
        sa.Column(
            "journal_entry_id",
            UUID(as_uuid=True),
            sa.ForeignKey("journal_entries.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("bill_number", name="uq_vendor_bills_bill_number"),
    )
    op.create_index("ix_vendor_bills_vendor_id", "vendor_bills", ["vendor_id"])

    op.create_table(
        "vendor_payments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("payment_number", sa.String(30), nullable=False),
        sa.Column(
            "vendor_bill_id",
            UUID(as_uuid=True),
            sa.ForeignKey("vendor_bills.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "payment_account_id",
            UUID(as_uuid=True),
            sa.ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("reference_number", sa.String(100), nullable=True),
        sa.Column(
            "journal_entry_id",
            UUID(as_uuid=True),
            sa.ForeignKey("journal_entries.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("payment_number", name="uq_vendor_payments_payment_number"),
    )


def downgrade() -> None:
    op.drop_table("vendor_payments")
    op.drop_table("vendor_bills")
    op.drop_table("account_vendors")
    op.drop_table("income_vouchers")
    op.drop_table("expense_vouchers")
    op.drop_table("journal_lines")
    op.drop_table("journal_entries")
    op.drop_table("chart_of_accounts")
    op.execute("DROP SEQUENCE IF EXISTS ap_payment_number_seq")
    op.execute("DROP SEQUENCE IF EXISTS vendor_bill_number_seq")
    op.execute("DROP SEQUENCE IF EXISTS voucher_number_seq")
    op.execute("DROP SEQUENCE IF EXISTS journal_entry_number_seq")
