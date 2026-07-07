"""create laboratory tables

Revision ID: 202607072000
Revises: 202607071900
Create Date: 2026-07-07 20:00:00.000000

Laboratory bounded context: lab test master catalog, lab orders,
order line items, and status history linked to consultations.
"""

from collections.abc import Sequence
from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision: str = "202607072000"
down_revision: str | None = "202607071900"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COMMON_LAB_TESTS = [
    {
        "id": uuid4(),
        "test_code": "CBC",
        "test_name": "Complete Blood Count",
        "department": "Hematology",
        "sample_type": "blood",
        "normal_turnaround_time": "4 hours",
        "price": 350.00,
    },
    {
        "id": uuid4(),
        "test_code": "LFT",
        "test_name": "Liver Function Test",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "6 hours",
        "price": 650.00,
    },
    {
        "id": uuid4(),
        "test_code": "RFT",
        "test_name": "Renal Function Test",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "6 hours",
        "price": 550.00,
    },
    {
        "id": uuid4(),
        "test_code": "FBS",
        "test_name": "Fasting Blood Sugar",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "2 hours",
        "price": 120.00,
    },
    {
        "id": uuid4(),
        "test_code": "PPBS",
        "test_name": "Post Prandial Blood Sugar",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "2 hours",
        "price": 120.00,
    },
    {
        "id": uuid4(),
        "test_code": "HBA1C",
        "test_name": "HbA1c",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "24 hours",
        "price": 450.00,
    },
    {
        "id": uuid4(),
        "test_code": "LIPID",
        "test_name": "Lipid Profile",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "6 hours",
        "price": 500.00,
    },
    {
        "id": uuid4(),
        "test_code": "TSH",
        "test_name": "Thyroid Stimulating Hormone",
        "department": "Endocrinology",
        "sample_type": "blood",
        "normal_turnaround_time": "24 hours",
        "price": 400.00,
    },
    {
        "id": uuid4(),
        "test_code": "URINE-R",
        "test_name": "Urine Routine Examination",
        "department": "Clinical Pathology",
        "sample_type": "urine",
        "normal_turnaround_time": "2 hours",
        "price": 150.00,
    },
    {
        "id": uuid4(),
        "test_code": "URINE-C",
        "test_name": "Urine Culture",
        "department": "Microbiology",
        "sample_type": "urine",
        "normal_turnaround_time": "48 hours",
        "price": 600.00,
    },
    {
        "id": uuid4(),
        "test_code": "ESR",
        "test_name": "Erythrocyte Sedimentation Rate",
        "department": "Hematology",
        "sample_type": "blood",
        "normal_turnaround_time": "2 hours",
        "price": 100.00,
    },
    {
        "id": uuid4(),
        "test_code": "PT-INR",
        "test_name": "Prothrombin Time / INR",
        "department": "Hematology",
        "sample_type": "blood",
        "normal_turnaround_time": "4 hours",
        "price": 300.00,
    },
    {
        "id": uuid4(),
        "test_code": "CRP",
        "test_name": "C-Reactive Protein",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "4 hours",
        "price": 450.00,
    },
    {
        "id": uuid4(),
        "test_code": "VIT-D",
        "test_name": "Vitamin D (25-OH)",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "48 hours",
        "price": 1200.00,
    },
    {
        "id": uuid4(),
        "test_code": "VIT-B12",
        "test_name": "Vitamin B12",
        "department": "Biochemistry",
        "sample_type": "blood",
        "normal_turnaround_time": "24 hours",
        "price": 800.00,
    },
]


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS lab_order_number_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "lab_test_master",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("test_code", sa.String(length=30), nullable=False),
        sa.Column("test_name", sa.String(length=200), nullable=False),
        sa.Column("department", sa.String(length=100), nullable=False),
        sa.Column("sample_type", sa.String(length=20), nullable=False),
        sa.Column("normal_turnaround_time", sa.String(length=50), nullable=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_lab_test_master"),
        sa.UniqueConstraint("test_code", name="uq_lab_test_master_test_code"),
    )
    op.create_index("ix_lab_test_master_test_name", "lab_test_master", ["test_name"])
    op.create_index("ix_lab_test_master_department", "lab_test_master", ["department"])

    op.create_table(
        "lab_orders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("consultation_id", sa.Uuid(), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("doctor_id", sa.Uuid(), nullable=False),
        sa.Column("order_number", sa.String(length=30), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("clinical_notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
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
        sa.PrimaryKeyConstraint("id", name="pk_lab_orders"),
        sa.ForeignKeyConstraint(
            ["consultation_id"],
            ["consultations.id"],
            name="fk_lab_orders_consultation_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["patients.id"],
            name="fk_lab_orders_patient_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["doctor_id"],
            ["doctors.id"],
            name="fk_lab_orders_doctor_id",
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("order_number", name="uq_lab_orders_order_number"),
    )
    op.create_index("ix_lab_orders_consultation_id", "lab_orders", ["consultation_id"])
    op.create_index("ix_lab_orders_patient_id", "lab_orders", ["patient_id"])
    op.create_index("ix_lab_orders_doctor_id", "lab_orders", ["doctor_id"])
    op.create_index("ix_lab_orders_order_number", "lab_orders", ["order_number"])
    op.create_index("ix_lab_orders_status", "lab_orders", ["status"])

    op.create_table(
        "lab_order_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("lab_order_id", sa.Uuid(), nullable=False),
        sa.Column("lab_test_master_id", sa.Uuid(), nullable=True),
        sa.Column("lab_test_name", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("sample_type", sa.String(length=20), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id", name="pk_lab_order_items"),
        sa.ForeignKeyConstraint(
            ["lab_order_id"],
            ["lab_orders.id"],
            name="fk_lab_order_items_lab_order_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["lab_test_master_id"],
            ["lab_test_master.id"],
            name="fk_lab_order_items_lab_test_master_id",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_lab_order_items_lab_order_id", "lab_order_items", ["lab_order_id"])
    op.create_index("ix_lab_order_items_lab_test_master_id", "lab_order_items", ["lab_test_master_id"])

    op.create_table(
        "lab_order_status_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("lab_order_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_lab_order_status_events"),
        sa.ForeignKeyConstraint(
            ["lab_order_id"],
            ["lab_orders.id"],
            name="fk_lab_order_status_events_lab_order_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_lab_order_status_events_lab_order_id",
        "lab_order_status_events",
        ["lab_order_id"],
    )

    test_table = sa.table(
        "lab_test_master",
        sa.column("id", sa.Uuid()),
        sa.column("test_code", sa.String()),
        sa.column("test_name", sa.String()),
        sa.column("department", sa.String()),
        sa.column("sample_type", sa.String()),
        sa.column("normal_turnaround_time", sa.String()),
        sa.column("price", sa.Numeric(10, 2)),
    )
    op.bulk_insert(test_table, COMMON_LAB_TESTS)


def downgrade() -> None:
    op.drop_index("ix_lab_order_status_events_lab_order_id", table_name="lab_order_status_events")
    op.drop_table("lab_order_status_events")
    op.drop_index("ix_lab_order_items_lab_test_master_id", table_name="lab_order_items")
    op.drop_index("ix_lab_order_items_lab_order_id", table_name="lab_order_items")
    op.drop_table("lab_order_items")
    op.drop_index("ix_lab_orders_status", table_name="lab_orders")
    op.drop_index("ix_lab_orders_order_number", table_name="lab_orders")
    op.drop_index("ix_lab_orders_doctor_id", table_name="lab_orders")
    op.drop_index("ix_lab_orders_patient_id", table_name="lab_orders")
    op.drop_index("ix_lab_orders_consultation_id", table_name="lab_orders")
    op.drop_table("lab_orders")
    op.drop_index("ix_lab_test_master_department", table_name="lab_test_master")
    op.drop_index("ix_lab_test_master_test_name", table_name="lab_test_master")
    op.drop_table("lab_test_master")
    op.execute("DROP SEQUENCE IF EXISTS lab_order_number_seq")
