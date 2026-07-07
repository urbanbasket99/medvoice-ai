"""create radiology tables

Revision ID: 202607072100
Revises: 202607072000
Create Date: 2026-07-07 21:00:00.000000

Radiology bounded context: radiology test master catalog, radiology orders,
order line items, and status history linked to consultations.
"""

from collections.abc import Sequence
from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision: str = "202607072100"
down_revision: str | None = "202607072000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COMMON_RADIOLOGY_TESTS = [
    {
        "id": uuid4(),
        "test_code": "CXR-PA",
        "test_name": "Chest X-Ray PA View",
        "category": "xray",
        "body_part": "Chest",
        "estimated_duration": "15 minutes",
        "price": 400.00,
    },
    {
        "id": uuid4(),
        "test_code": "CT-BRAIN",
        "test_name": "CT Brain Plain",
        "category": "ct",
        "body_part": "Brain",
        "estimated_duration": "30 minutes",
        "price": 3500.00,
    },
    {
        "id": uuid4(),
        "test_code": "MRI-SPINE",
        "test_name": "MRI Spine",
        "category": "mri",
        "body_part": "Spine",
        "estimated_duration": "45 minutes",
        "price": 6500.00,
    },
    {
        "id": uuid4(),
        "test_code": "USG-ABD",
        "test_name": "USG Abdomen",
        "category": "ultrasound",
        "body_part": "Abdomen",
        "estimated_duration": "20 minutes",
        "price": 1200.00,
    },
    {
        "id": uuid4(),
        "test_code": "MAMMO-BIL",
        "test_name": "Mammography Bilateral",
        "category": "mammography",
        "body_part": "Breast",
        "estimated_duration": "30 minutes",
        "price": 2500.00,
    },
    {
        "id": uuid4(),
        "test_code": "XR-KNEE",
        "test_name": "X-Ray Knee AP/Lateral",
        "category": "xray",
        "body_part": "Knee",
        "estimated_duration": "15 minutes",
        "price": 500.00,
    },
    {
        "id": uuid4(),
        "test_code": "CT-CHEST-C",
        "test_name": "CT Chest with Contrast",
        "category": "ct",
        "body_part": "Chest",
        "estimated_duration": "40 minutes",
        "price": 5500.00,
    },
    {
        "id": uuid4(),
        "test_code": "MRI-BRAIN-C",
        "test_name": "MRI Brain with Contrast",
        "category": "mri",
        "body_part": "Brain",
        "estimated_duration": "50 minutes",
        "price": 8500.00,
    },
    {
        "id": uuid4(),
        "test_code": "USG-PELV",
        "test_name": "USG Pelvis",
        "category": "ultrasound",
        "body_part": "Pelvis",
        "estimated_duration": "20 minutes",
        "price": 1100.00,
    },
    {
        "id": uuid4(),
        "test_code": "XR-HAND",
        "test_name": "X-Ray Hand",
        "category": "xray",
        "body_part": "Hand",
        "estimated_duration": "15 minutes",
        "price": 450.00,
    },
    {
        "id": uuid4(),
        "test_code": "CT-ABD-PEL",
        "test_name": "CT Abdomen and Pelvis",
        "category": "ct",
        "body_part": "Abdomen",
        "estimated_duration": "45 minutes",
        "price": 6000.00,
    },
    {
        "id": uuid4(),
        "test_code": "MRI-KNEE",
        "test_name": "MRI Knee",
        "category": "mri",
        "body_part": "Knee",
        "estimated_duration": "40 minutes",
        "price": 7000.00,
    },
    {
        "id": uuid4(),
        "test_code": "FLU-BARIUM",
        "test_name": "Fluoroscopy Barium Swallow",
        "category": "fluoroscopy",
        "body_part": "Esophagus",
        "estimated_duration": "30 minutes",
        "price": 2800.00,
    },
    {
        "id": uuid4(),
        "test_code": "NM-BONE",
        "test_name": "Nuclear Medicine Bone Scan",
        "category": "nuclear",
        "body_part": "Whole Body",
        "estimated_duration": "3 hours",
        "price": 4500.00,
    },
    {
        "id": uuid4(),
        "test_code": "XR-LSPINE",
        "test_name": "X-Ray Lumbar Spine AP/Lateral",
        "category": "xray",
        "body_part": "Lumbar Spine",
        "estimated_duration": "15 minutes",
        "price": 550.00,
    },
]


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS radiology_order_number_seq START WITH 1 INCREMENT BY 1")

    op.create_table(
        "radiology_test_master",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("test_code", sa.String(length=30), nullable=False),
        sa.Column("test_name", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("body_part", sa.String(length=100), nullable=False),
        sa.Column("estimated_duration", sa.String(length=50), nullable=True),
        sa.Column("price", sa.Numeric(10, 2), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_radiology_test_master"),
        sa.UniqueConstraint("test_code", name="uq_radiology_test_master_test_code"),
    )
    op.create_index("ix_radiology_test_master_test_name", "radiology_test_master", ["test_name"])
    op.create_index("ix_radiology_test_master_category", "radiology_test_master", ["category"])

    op.create_table(
        "radiology_orders",
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
        sa.PrimaryKeyConstraint("id", name="pk_radiology_orders"),
        sa.ForeignKeyConstraint(
            ["consultation_id"],
            ["consultations.id"],
            name="fk_radiology_orders_consultation_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["patients.id"],
            name="fk_radiology_orders_patient_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["doctor_id"],
            ["doctors.id"],
            name="fk_radiology_orders_doctor_id",
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("order_number", name="uq_radiology_orders_order_number"),
    )
    op.create_index("ix_radiology_orders_consultation_id", "radiology_orders", ["consultation_id"])
    op.create_index("ix_radiology_orders_patient_id", "radiology_orders", ["patient_id"])
    op.create_index("ix_radiology_orders_doctor_id", "radiology_orders", ["doctor_id"])
    op.create_index("ix_radiology_orders_order_number", "radiology_orders", ["order_number"])
    op.create_index("ix_radiology_orders_status", "radiology_orders", ["status"])

    op.create_table(
        "radiology_order_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("radiology_order_id", sa.Uuid(), nullable=False),
        sa.Column("radiology_test_master_id", sa.Uuid(), nullable=True),
        sa.Column("test_name", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("body_part", sa.String(length=100), nullable=False),
        sa.Column("contrast_required", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id", name="pk_radiology_order_items"),
        sa.ForeignKeyConstraint(
            ["radiology_order_id"],
            ["radiology_orders.id"],
            name="fk_radiology_order_items_radiology_order_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["radiology_test_master_id"],
            ["radiology_test_master.id"],
            name="fk_radiology_order_items_radiology_test_master_id",
            ondelete="SET NULL",
        ),
    )
    op.create_index(
        "ix_radiology_order_items_radiology_order_id",
        "radiology_order_items",
        ["radiology_order_id"],
    )
    op.create_index(
        "ix_radiology_order_items_radiology_test_master_id",
        "radiology_order_items",
        ["radiology_test_master_id"],
    )

    op.create_table(
        "radiology_order_status_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("radiology_order_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_radiology_order_status_events"),
        sa.ForeignKeyConstraint(
            ["radiology_order_id"],
            ["radiology_orders.id"],
            name="fk_radiology_order_status_events_radiology_order_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_radiology_order_status_events_radiology_order_id",
        "radiology_order_status_events",
        ["radiology_order_id"],
    )

    test_table = sa.table(
        "radiology_test_master",
        sa.column("id", sa.Uuid()),
        sa.column("test_code", sa.String()),
        sa.column("test_name", sa.String()),
        sa.column("category", sa.String()),
        sa.column("body_part", sa.String()),
        sa.column("estimated_duration", sa.String()),
        sa.column("price", sa.Numeric(10, 2)),
    )
    op.bulk_insert(test_table, COMMON_RADIOLOGY_TESTS)


def downgrade() -> None:
    op.drop_index(
        "ix_radiology_order_status_events_radiology_order_id",
        table_name="radiology_order_status_events",
    )
    op.drop_table("radiology_order_status_events")
    op.drop_index(
        "ix_radiology_order_items_radiology_test_master_id",
        table_name="radiology_order_items",
    )
    op.drop_index("ix_radiology_order_items_radiology_order_id", table_name="radiology_order_items")
    op.drop_table("radiology_order_items")
    op.drop_index("ix_radiology_orders_status", table_name="radiology_orders")
    op.drop_index("ix_radiology_orders_order_number", table_name="radiology_orders")
    op.drop_index("ix_radiology_orders_doctor_id", table_name="radiology_orders")
    op.drop_index("ix_radiology_orders_patient_id", table_name="radiology_orders")
    op.drop_index("ix_radiology_orders_consultation_id", table_name="radiology_orders")
    op.drop_table("radiology_orders")
    op.drop_index("ix_radiology_test_master_category", table_name="radiology_test_master")
    op.drop_index("ix_radiology_test_master_test_name", table_name="radiology_test_master")
    op.drop_table("radiology_test_master")
    op.execute("DROP SEQUENCE IF EXISTS radiology_order_number_seq")
