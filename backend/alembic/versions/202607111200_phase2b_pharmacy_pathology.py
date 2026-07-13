"""phase 2b pharmacy and pathology depth

Revision ID: 202607111200
Revises: 202607101200
Create Date: 2026-07-11 12:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "202607111200"
down_revision = "202607101200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE SEQUENCE IF NOT EXISTS pharmacy_vendor_payment_number_seq START WITH 1 INCREMENT BY 1"
    )

    # Supplier code for easier lookup
    op.add_column("pharmacy_suppliers", sa.Column("code", sa.String(30), nullable=True))
    op.add_column("pharmacy_suppliers", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_pharmacy_suppliers_code", "pharmacy_suppliers", ["code"], unique=True)

    # Vendor payments
    op.create_table(
        "pharmacy_vendor_payments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("payment_number", sa.String(30), nullable=False),
        sa.Column(
            "supplier_id",
            UUID(as_uuid=True),
            sa.ForeignKey("pharmacy_suppliers.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("payment_method", sa.String(30), nullable=False, server_default="cash"),
        sa.Column("reference_number", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("payment_number", name="uq_pharmacy_vendor_payments_number"),
    )
    op.create_index("ix_pharmacy_vendor_payments_supplier_id", "pharmacy_vendor_payments", ["supplier_id"])

    # Retail / walk-in dispense support
    op.add_column(
        "dispense_records",
        sa.Column("dispense_type", sa.String(20), nullable=False, server_default="prescription"),
    )
    op.alter_column("dispense_records", "prescription_id", existing_type=UUID(as_uuid=True), nullable=True)
    op.alter_column("dispense_records", "consultation_id", existing_type=UUID(as_uuid=True), nullable=True)
    op.alter_column("dispense_records", "doctor_id", existing_type=UUID(as_uuid=True), nullable=True)

    # Lab sample barcode + partial reporting
    op.add_column("lab_order_items", sa.Column("sample_barcode", sa.String(64), nullable=True))
    op.create_index("ix_lab_order_items_sample_barcode", "lab_order_items", ["sample_barcode"])
    op.add_column(
        "lab_orders",
        sa.Column("is_partial_report", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )

    # Email delivery log (lab reports)
    op.create_table(
        "report_email_deliveries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("resource_type", sa.String(40), nullable=False),  # lab_results
        sa.Column("resource_id", UUID(as_uuid=True), nullable=False),
        sa.Column("recipient_email", sa.String(255), nullable=False),
        sa.Column("recipient_role", sa.String(30), nullable=True),  # patient|doctor
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="queued"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_report_email_deliveries_resource", "report_email_deliveries", ["resource_type", "resource_id"])


def downgrade() -> None:
    op.execute("DROP SEQUENCE IF EXISTS pharmacy_vendor_payment_number_seq")

    op.drop_index("ix_report_email_deliveries_resource", table_name="report_email_deliveries")
    op.drop_table("report_email_deliveries")

    op.drop_column("lab_orders", "is_partial_report")
    op.drop_index("ix_lab_order_items_sample_barcode", table_name="lab_order_items")
    op.drop_column("lab_order_items", "sample_barcode")

    op.alter_column("dispense_records", "doctor_id", existing_type=UUID(as_uuid=True), nullable=False)
    op.alter_column("dispense_records", "consultation_id", existing_type=UUID(as_uuid=True), nullable=False)
    op.alter_column("dispense_records", "prescription_id", existing_type=UUID(as_uuid=True), nullable=False)
    op.drop_column("dispense_records", "dispense_type")

    op.drop_index("ix_pharmacy_vendor_payments_supplier_id", table_name="pharmacy_vendor_payments")
    op.drop_table("pharmacy_vendor_payments")

    op.drop_index("ix_pharmacy_suppliers_code", table_name="pharmacy_suppliers")
    op.drop_column("pharmacy_suppliers", "updated_at")
    op.drop_column("pharmacy_suppliers", "code")
