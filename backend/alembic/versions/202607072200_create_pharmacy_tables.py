"""create pharmacy tables

Revision ID: 202607072200
Revises: 202607072100
Create Date: 2026-07-07 22:00:00.000000

Pharmacy bounded context: suppliers, medicine inventory, batches, stock,
dispense records, stock movements.
"""

from collections.abc import Sequence
from datetime import date, timedelta
from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision: str = "202607072200"
down_revision: str | None = "202607072100"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SUPPLIER_IDS = [uuid4() for _ in range(3)]
MEDICINE_IDS = [uuid4() for _ in range(10)]
BATCH_IDS = [uuid4() for _ in range(10)]
STOCK_IDS = [uuid4() for _ in range(10)]

TODAY = date.today()
EXPIRY_FAR = TODAY + timedelta(days=365)
EXPIRY_NEAR = TODAY + timedelta(days=180)

PHARMACY_SUPPLIERS = [
    {
        "id": SUPPLIER_IDS[0],
        "name": "MedSupply India Pvt Ltd",
        "contact_person": "Rajesh Kumar",
        "phone": "+91-9876543210",
        "email": "orders@medsupply.in",
        "address": "12 Industrial Estate, Hyderabad",
        "is_active": True,
    },
    {
        "id": SUPPLIER_IDS[1],
        "name": "Pharma Distributors Co",
        "contact_person": "Priya Sharma",
        "phone": "+91-9123456789",
        "email": "sales@pharmadist.co",
        "address": "45 MG Road, Bengaluru",
        "is_active": True,
    },
    {
        "id": SUPPLIER_IDS[2],
        "name": "Global Health Supplies",
        "contact_person": "Amit Patel",
        "phone": "+91-9988776655",
        "email": "info@globalhealth.in",
        "address": "78 Sector 18, Noida",
        "is_active": True,
    },
]

PHARMACY_MEDICINES = [
    {
        "id": MEDICINE_IDS[0],
        "medicine_code": "PHM-PARA500",
        "generic_name": "Paracetamol",
        "brand_name": "Crocin",
        "strength": "500mg",
        "dosage_form": "Tablet",
        "manufacturer": "GSK",
        "category": "tablet",
        "mrp": 25.00,
        "selling_price": 20.00,
        "gst": 5.00,
        "barcode": "8901234567001",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[1],
        "medicine_code": "PHM-AMOX500",
        "generic_name": "Amoxicillin",
        "brand_name": "Moxikind",
        "strength": "500mg",
        "dosage_form": "Capsule",
        "manufacturer": "Mankind",
        "category": "capsule",
        "mrp": 85.00,
        "selling_price": 72.00,
        "gst": 5.00,
        "barcode": "8901234567002",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[2],
        "medicine_code": "PHM-IBUP400",
        "generic_name": "Ibuprofen",
        "brand_name": "Brufen",
        "strength": "400mg",
        "dosage_form": "Tablet",
        "manufacturer": "Abbott",
        "category": "tablet",
        "mrp": 45.00,
        "selling_price": 38.00,
        "gst": 5.00,
        "barcode": "8901234567003",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[3],
        "medicine_code": "PHM-CETZ10",
        "generic_name": "Cetirizine",
        "brand_name": "Alerid",
        "strength": "10mg",
        "dosage_form": "Tablet",
        "manufacturer": "Cipla",
        "category": "tablet",
        "mrp": 35.00,
        "selling_price": 28.00,
        "gst": 5.00,
        "barcode": "8901234567004",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[4],
        "medicine_code": "PHM-OMEP20",
        "generic_name": "Omeprazole",
        "brand_name": "Omez",
        "strength": "20mg",
        "dosage_form": "Capsule",
        "manufacturer": "Dr Reddy's",
        "category": "capsule",
        "mrp": 55.00,
        "selling_price": 45.00,
        "gst": 5.00,
        "barcode": "8901234567005",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[5],
        "medicine_code": "PHM-METO50",
        "generic_name": "Metformin",
        "brand_name": "Glycomet",
        "strength": "500mg",
        "dosage_form": "Tablet",
        "manufacturer": "USV",
        "category": "tablet",
        "mrp": 40.00,
        "selling_price": 32.00,
        "gst": 5.00,
        "barcode": "8901234567006",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[6],
        "medicine_code": "PHM-AMLO5",
        "generic_name": "Amlodipine",
        "brand_name": "Amlong",
        "strength": "5mg",
        "dosage_form": "Tablet",
        "manufacturer": "Micro Labs",
        "category": "tablet",
        "mrp": 60.00,
        "selling_price": 50.00,
        "gst": 5.00,
        "barcode": "8901234567007",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[7],
        "medicine_code": "PHM-SALB100",
        "generic_name": "Salbutamol",
        "brand_name": "Asthalin",
        "strength": "100mcg",
        "dosage_form": "Inhaler",
        "manufacturer": "Cipla",
        "category": "inhaler",
        "mrp": 180.00,
        "selling_price": 155.00,
        "gst": 5.00,
        "barcode": "8901234567008",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[8],
        "medicine_code": "PHM-COUGH100",
        "generic_name": "Dextromethorphan",
        "brand_name": "Benadryl",
        "strength": "100ml",
        "dosage_form": "Syrup",
        "manufacturer": "J&J",
        "category": "syrup",
        "mrp": 95.00,
        "selling_price": 80.00,
        "gst": 5.00,
        "barcode": "8901234567009",
        "is_active": True,
    },
    {
        "id": MEDICINE_IDS[9],
        "medicine_code": "PHM-INS10",
        "generic_name": "Human Insulin",
        "brand_name": "Huminsulin",
        "strength": "40IU/ml",
        "dosage_form": "Injection",
        "manufacturer": "Eli Lilly",
        "category": "injection",
        "mrp": 320.00,
        "selling_price": 280.00,
        "gst": 5.00,
        "barcode": "8901234567010",
        "is_active": True,
    },
]

PHARMACY_BATCHES = [
    {
        "id": BATCH_IDS[i],
        "medicine_id": MEDICINE_IDS[i],
        "batch_number": f"BATCH-2026-{i + 1:03d}",
        "expiry_date": EXPIRY_FAR if i < 7 else EXPIRY_NEAR,
        "quantity": 500 if i < 5 else (50 if i == 7 else 200),
        "purchase_price": float(PHARMACY_MEDICINES[i]["selling_price"]) * 0.7,
        "selling_price": PHARMACY_MEDICINES[i]["selling_price"],
        "supplier_id": SUPPLIER_IDS[i % 3],
    }
    for i in range(10)
]

PHARMACY_MEDICINE_STOCK = [
    {
        "id": STOCK_IDS[i],
        "medicine_id": MEDICINE_IDS[i],
        "current_stock": 500 if i < 5 else (50 if i == 7 else 200),
        "reserved_stock": 0,
        "minimum_stock": 50 if i < 5 else (10 if i == 7 else 30),
        "maximum_stock": 1000,
    }
    for i in range(10)
]


def upgrade() -> None:
    op.execute(
        "CREATE SEQUENCE IF NOT EXISTS pharmacy_dispense_number_seq START WITH 1 INCREMENT BY 1"
    )

    op.create_table(
        "pharmacy_suppliers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("contact_person", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_pharmacy_suppliers"),
    )
    op.create_index("ix_pharmacy_suppliers_name", "pharmacy_suppliers", ["name"])

    op.create_table(
        "pharmacy_medicines",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("medicine_code", sa.String(length=30), nullable=False),
        sa.Column("generic_name", sa.String(length=200), nullable=False),
        sa.Column("brand_name", sa.String(length=200), nullable=False),
        sa.Column("strength", sa.String(length=50), nullable=True),
        sa.Column("dosage_form", sa.String(length=50), nullable=True),
        sa.Column("manufacturer", sa.String(length=200), nullable=True),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("mrp", sa.Numeric(10, 2), nullable=False),
        sa.Column("selling_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("gst", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("barcode", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
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
        sa.PrimaryKeyConstraint("id", name="pk_pharmacy_medicines"),
        sa.UniqueConstraint("medicine_code", name="uq_pharmacy_medicines_medicine_code"),
    )
    op.create_index("ix_pharmacy_medicines_generic_name", "pharmacy_medicines", ["generic_name"])
    op.create_index("ix_pharmacy_medicines_brand_name", "pharmacy_medicines", ["brand_name"])
    op.create_index("ix_pharmacy_medicines_category", "pharmacy_medicines", ["category"])

    op.create_table(
        "pharmacy_batches",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("medicine_id", sa.Uuid(), nullable=False),
        sa.Column("batch_number", sa.String(length=50), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("purchase_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("selling_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("supplier_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_pharmacy_batches"),
        sa.ForeignKeyConstraint(
            ["medicine_id"],
            ["pharmacy_medicines.id"],
            name="fk_pharmacy_batches_medicine_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["supplier_id"],
            ["pharmacy_suppliers.id"],
            name="fk_pharmacy_batches_supplier_id",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_pharmacy_batches_medicine_id", "pharmacy_batches", ["medicine_id"])
    op.create_index("ix_pharmacy_batches_batch_number", "pharmacy_batches", ["batch_number"])
    op.create_index("ix_pharmacy_batches_expiry_date", "pharmacy_batches", ["expiry_date"])

    op.create_table(
        "pharmacy_medicine_stock",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("medicine_id", sa.Uuid(), nullable=False),
        sa.Column("current_stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reserved_stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("minimum_stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("maximum_stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_pharmacy_medicine_stock"),
        sa.ForeignKeyConstraint(
            ["medicine_id"],
            ["pharmacy_medicines.id"],
            name="fk_pharmacy_medicine_stock_medicine_id",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("medicine_id", name="uq_pharmacy_medicine_stock_medicine_id"),
    )
    op.create_index(
        "ix_pharmacy_medicine_stock_medicine_id", "pharmacy_medicine_stock", ["medicine_id"]
    )

    op.create_table(
        "dispense_records",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("prescription_id", sa.Uuid(), nullable=False),
        sa.Column("consultation_id", sa.Uuid(), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("doctor_id", sa.Uuid(), nullable=False),
        sa.Column("dispensed_by", sa.Uuid(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("dispensed_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.Column("order_number", sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_dispense_records"),
        sa.ForeignKeyConstraint(
            ["prescription_id"],
            ["prescriptions.id"],
            name="fk_dispense_records_prescription_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["consultation_id"],
            ["consultations.id"],
            name="fk_dispense_records_consultation_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["patients.id"],
            name="fk_dispense_records_patient_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["doctor_id"],
            ["doctors.id"],
            name="fk_dispense_records_doctor_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["dispensed_by"],
            ["users.id"],
            name="fk_dispense_records_dispensed_by",
            ondelete="SET NULL",
        ),
        sa.UniqueConstraint("order_number", name="uq_dispense_records_order_number"),
    )
    op.create_index("ix_dispense_records_prescription_id", "dispense_records", ["prescription_id"])
    op.create_index("ix_dispense_records_consultation_id", "dispense_records", ["consultation_id"])
    op.create_index("ix_dispense_records_patient_id", "dispense_records", ["patient_id"])
    op.create_index("ix_dispense_records_doctor_id", "dispense_records", ["doctor_id"])
    op.create_index("ix_dispense_records_status", "dispense_records", ["status"])
    op.create_index("ix_dispense_records_order_number", "dispense_records", ["order_number"])

    op.create_table(
        "dispense_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("dispense_id", sa.Uuid(), nullable=False),
        sa.Column("prescription_item_id", sa.Uuid(), nullable=True),
        sa.Column("medicine_id", sa.Uuid(), nullable=True),
        sa.Column("batch_id", sa.Uuid(), nullable=True),
        sa.Column("medicine_name", sa.String(length=200), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id", name="pk_dispense_items"),
        sa.ForeignKeyConstraint(
            ["dispense_id"],
            ["dispense_records.id"],
            name="fk_dispense_items_dispense_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["prescription_item_id"],
            ["prescription_items.id"],
            name="fk_dispense_items_prescription_item_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["medicine_id"],
            ["pharmacy_medicines.id"],
            name="fk_dispense_items_medicine_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["batch_id"],
            ["pharmacy_batches.id"],
            name="fk_dispense_items_batch_id",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_dispense_items_dispense_id", "dispense_items", ["dispense_id"])
    op.create_index("ix_dispense_items_medicine_id", "dispense_items", ["medicine_id"])

    op.create_table(
        "dispense_status_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("dispense_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_dispense_status_events"),
        sa.ForeignKeyConstraint(
            ["dispense_id"],
            ["dispense_records.id"],
            name="fk_dispense_status_events_dispense_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_dispense_status_events_dispense_id", "dispense_status_events", ["dispense_id"]
    )

    op.create_table(
        "stock_movements",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("medicine_id", sa.Uuid(), nullable=False),
        sa.Column("batch_id", sa.Uuid(), nullable=True),
        sa.Column("movement_type", sa.String(length=20), nullable=False),
        sa.Column("quantity_delta", sa.Integer(), nullable=False),
        sa.Column("reference_type", sa.String(length=50), nullable=True),
        sa.Column("reference_id", sa.Uuid(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_stock_movements"),
        sa.ForeignKeyConstraint(
            ["medicine_id"],
            ["pharmacy_medicines.id"],
            name="fk_stock_movements_medicine_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["batch_id"],
            ["pharmacy_batches.id"],
            name="fk_stock_movements_batch_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
            name="fk_stock_movements_created_by",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_stock_movements_medicine_id", "stock_movements", ["medicine_id"])
    op.create_index("ix_stock_movements_batch_id", "stock_movements", ["batch_id"])
    op.create_index("ix_stock_movements_movement_type", "stock_movements", ["movement_type"])
    op.create_index("ix_stock_movements_created_at", "stock_movements", ["created_at"])

    supplier_table = sa.table(
        "pharmacy_suppliers",
        sa.column("id", sa.Uuid()),
        sa.column("name", sa.String()),
        sa.column("contact_person", sa.String()),
        sa.column("phone", sa.String()),
        sa.column("email", sa.String()),
        sa.column("address", sa.Text()),
        sa.column("is_active", sa.Boolean()),
    )
    op.bulk_insert(supplier_table, PHARMACY_SUPPLIERS)

    medicine_table = sa.table(
        "pharmacy_medicines",
        sa.column("id", sa.Uuid()),
        sa.column("medicine_code", sa.String()),
        sa.column("generic_name", sa.String()),
        sa.column("brand_name", sa.String()),
        sa.column("strength", sa.String()),
        sa.column("dosage_form", sa.String()),
        sa.column("manufacturer", sa.String()),
        sa.column("category", sa.String()),
        sa.column("mrp", sa.Numeric(10, 2)),
        sa.column("selling_price", sa.Numeric(10, 2)),
        sa.column("gst", sa.Numeric(5, 2)),
        sa.column("barcode", sa.String()),
        sa.column("is_active", sa.Boolean()),
    )
    op.bulk_insert(medicine_table, PHARMACY_MEDICINES)

    batch_table = sa.table(
        "pharmacy_batches",
        sa.column("id", sa.Uuid()),
        sa.column("medicine_id", sa.Uuid()),
        sa.column("batch_number", sa.String()),
        sa.column("expiry_date", sa.Date()),
        sa.column("quantity", sa.Integer()),
        sa.column("purchase_price", sa.Numeric(10, 2)),
        sa.column("selling_price", sa.Numeric(10, 2)),
        sa.column("supplier_id", sa.Uuid()),
    )
    op.bulk_insert(batch_table, PHARMACY_BATCHES)

    stock_table = sa.table(
        "pharmacy_medicine_stock",
        sa.column("id", sa.Uuid()),
        sa.column("medicine_id", sa.Uuid()),
        sa.column("current_stock", sa.Integer()),
        sa.column("reserved_stock", sa.Integer()),
        sa.column("minimum_stock", sa.Integer()),
        sa.column("maximum_stock", sa.Integer()),
    )
    op.bulk_insert(stock_table, PHARMACY_MEDICINE_STOCK)


def downgrade() -> None:
    op.drop_index("ix_stock_movements_created_at", table_name="stock_movements")
    op.drop_index("ix_stock_movements_movement_type", table_name="stock_movements")
    op.drop_index("ix_stock_movements_batch_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_medicine_id", table_name="stock_movements")
    op.drop_table("stock_movements")
    op.drop_index("ix_dispense_status_events_dispense_id", table_name="dispense_status_events")
    op.drop_table("dispense_status_events")
    op.drop_index("ix_dispense_items_medicine_id", table_name="dispense_items")
    op.drop_index("ix_dispense_items_dispense_id", table_name="dispense_items")
    op.drop_table("dispense_items")
    op.drop_index("ix_dispense_records_order_number", table_name="dispense_records")
    op.drop_index("ix_dispense_records_status", table_name="dispense_records")
    op.drop_index("ix_dispense_records_doctor_id", table_name="dispense_records")
    op.drop_index("ix_dispense_records_patient_id", table_name="dispense_records")
    op.drop_index("ix_dispense_records_consultation_id", table_name="dispense_records")
    op.drop_index("ix_dispense_records_prescription_id", table_name="dispense_records")
    op.drop_table("dispense_records")
    op.drop_index("ix_pharmacy_medicine_stock_medicine_id", table_name="pharmacy_medicine_stock")
    op.drop_table("pharmacy_medicine_stock")
    op.drop_index("ix_pharmacy_batches_expiry_date", table_name="pharmacy_batches")
    op.drop_index("ix_pharmacy_batches_batch_number", table_name="pharmacy_batches")
    op.drop_index("ix_pharmacy_batches_medicine_id", table_name="pharmacy_batches")
    op.drop_table("pharmacy_batches")
    op.drop_index("ix_pharmacy_medicines_category", table_name="pharmacy_medicines")
    op.drop_index("ix_pharmacy_medicines_brand_name", table_name="pharmacy_medicines")
    op.drop_index("ix_pharmacy_medicines_generic_name", table_name="pharmacy_medicines")
    op.drop_table("pharmacy_medicines")
    op.drop_index("ix_pharmacy_suppliers_name", table_name="pharmacy_suppliers")
    op.drop_table("pharmacy_suppliers")
    op.execute("DROP SEQUENCE IF EXISTS pharmacy_dispense_number_seq")
