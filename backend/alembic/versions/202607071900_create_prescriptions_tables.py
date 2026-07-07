"""create prescriptions tables

Revision ID: 202607071900
Revises: 202607071800
Create Date: 2026-07-07 19:00:00.000000

Prescriptions bounded context: medicine master catalog, prescriptions,
and prescription line items linked to consultations.
"""

from collections.abc import Sequence
from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision: str = "202607071900"
down_revision: str | None = "202607071800"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COMMON_MEDICINES = [
    {
        "id": uuid4(),
        "name": "Paracetamol",
        "generic_name": "Acetaminophen",
        "strength": "500mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Ibuprofen",
        "generic_name": "Ibuprofen",
        "strength": "400mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "strength": "500mg",
        "form": "Capsule",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Azithromycin",
        "generic_name": "Azithromycin",
        "strength": "500mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Metformin",
        "generic_name": "Metformin",
        "strength": "500mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Omeprazole",
        "generic_name": "Omeprazole",
        "strength": "20mg",
        "form": "Capsule",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Cetirizine",
        "generic_name": "Cetirizine",
        "strength": "10mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Pantoprazole",
        "generic_name": "Pantoprazole",
        "strength": "40mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Amlodipine",
        "generic_name": "Amlodipine",
        "strength": "5mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Atorvastatin",
        "generic_name": "Atorvastatin",
        "strength": "10mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Montelukast",
        "generic_name": "Montelukast",
        "strength": "10mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Salbutamol",
        "generic_name": "Salbutamol",
        "strength": "100mcg",
        "form": "Inhaler",
        "default_route": "inhalation",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Diclofenac",
        "generic_name": "Diclofenac",
        "strength": "50mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Levocetirizine",
        "generic_name": "Levocetirizine",
        "strength": "5mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
    {
        "id": uuid4(),
        "name": "Metronidazole",
        "generic_name": "Metronidazole",
        "strength": "400mg",
        "form": "Tablet",
        "default_route": "oral",
        "manufacturer": "Generic",
    },
]


def upgrade() -> None:
    op.create_table(
        "medicine_master",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("generic_name", sa.String(length=200), nullable=True),
        sa.Column("strength", sa.String(length=50), nullable=True),
        sa.Column("form", sa.String(length=50), nullable=True),
        sa.Column("default_route", sa.String(length=20), nullable=True),
        sa.Column("manufacturer", sa.String(length=200), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_medicine_master"),
    )
    op.create_index("ix_medicine_master_name", "medicine_master", ["name"])

    op.create_table(
        "prescriptions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("consultation_id", sa.Uuid(), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("doctor_id", sa.Uuid(), nullable=False),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("advice", sa.Text(), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name="pk_prescriptions"),
        sa.ForeignKeyConstraint(
            ["consultation_id"],
            ["consultations.id"],
            name="fk_prescriptions_consultation_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["patients.id"],
            name="fk_prescriptions_patient_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["doctor_id"],
            ["doctors.id"],
            name="fk_prescriptions_doctor_id",
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_prescriptions_consultation_id", "prescriptions", ["consultation_id"])
    op.create_index("ix_prescriptions_patient_id", "prescriptions", ["patient_id"])
    op.create_index("ix_prescriptions_doctor_id", "prescriptions", ["doctor_id"])

    op.create_table(
        "prescription_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("prescription_id", sa.Uuid(), nullable=False),
        sa.Column("medicine_master_id", sa.Uuid(), nullable=True),
        sa.Column("medicine_name", sa.String(length=200), nullable=False),
        sa.Column("strength", sa.String(length=50), nullable=True),
        sa.Column("dosage", sa.String(length=100), nullable=True),
        sa.Column("frequency", sa.String(length=20), nullable=False),
        sa.Column("route", sa.String(length=20), nullable=False),
        sa.Column("duration", sa.String(length=50), nullable=True),
        sa.Column("quantity", sa.String(length=50), nullable=True),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("morning", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("afternoon", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("night", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("before_food", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("after_food", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.PrimaryKeyConstraint("id", name="pk_prescription_items"),
        sa.ForeignKeyConstraint(
            ["prescription_id"],
            ["prescriptions.id"],
            name="fk_prescription_items_prescription_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["medicine_master_id"],
            ["medicine_master.id"],
            name="fk_prescription_items_medicine_master_id",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_prescription_items_prescription_id", "prescription_items", ["prescription_id"])
    op.create_index("ix_prescription_items_medicine_master_id", "prescription_items", ["medicine_master_id"])

    medicine_table = sa.table(
        "medicine_master",
        sa.column("id", sa.Uuid()),
        sa.column("name", sa.String()),
        sa.column("generic_name", sa.String()),
        sa.column("strength", sa.String()),
        sa.column("form", sa.String()),
        sa.column("default_route", sa.String()),
        sa.column("manufacturer", sa.String()),
        sa.column("is_active", sa.Boolean()),
    )
    op.bulk_insert(
        medicine_table,
        [
            {
                "id": medicine["id"],
                "name": medicine["name"],
                "generic_name": medicine["generic_name"],
                "strength": medicine["strength"],
                "form": medicine["form"],
                "default_route": medicine["default_route"],
                "manufacturer": medicine["manufacturer"],
                "is_active": True,
            }
            for medicine in COMMON_MEDICINES
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_prescription_items_medicine_master_id", table_name="prescription_items")
    op.drop_index("ix_prescription_items_prescription_id", table_name="prescription_items")
    op.drop_table("prescription_items")
    op.drop_index("ix_prescriptions_doctor_id", table_name="prescriptions")
    op.drop_index("ix_prescriptions_patient_id", table_name="prescriptions")
    op.drop_index("ix_prescriptions_consultation_id", table_name="prescriptions")
    op.drop_table("prescriptions")
    op.drop_index("ix_medicine_master_name", table_name="medicine_master")
    op.drop_table("medicine_master")
