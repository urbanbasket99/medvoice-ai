from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.pharmacy.domain.value_objects import (
    DispenseStatus,
    DispenseType,
    MedicineCategory,
    StockReturnKind,
    VendorPaymentMethod,
)


@dataclass(frozen=True, slots=True)
class CreateMedicineInput:
    medicine_code: str
    generic_name: str
    brand_name: str
    category: MedicineCategory
    mrp: Decimal
    selling_price: Decimal
    gst: Decimal
    strength: str | None = None
    dosage_form: str | None = None
    manufacturer: str | None = None
    barcode: str | None = None
    is_active: bool = True
    minimum_stock: int = 0
    maximum_stock: int = 0


@dataclass(frozen=True, slots=True)
class UpdateMedicineInput:
    generic_name: str
    brand_name: str
    category: MedicineCategory
    mrp: Decimal
    selling_price: Decimal
    gst: Decimal
    strength: str | None = None
    dosage_form: str | None = None
    manufacturer: str | None = None
    barcode: str | None = None
    is_active: bool = True


@dataclass(frozen=True, slots=True)
class CreateBatchInput:
    medicine_id: UUID
    batch_number: str
    expiry_date: date
    quantity: int
    purchase_price: Decimal
    selling_price: Decimal
    supplier_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class UpdateBatchInput:
    batch_number: str
    expiry_date: date
    quantity: int
    purchase_price: Decimal
    selling_price: Decimal
    supplier_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class AdjustStockInput:
    medicine_id: UUID
    quantity_delta: int
    notes: str | None = None
    batch_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class PrescriptionItemContext:
    id: UUID
    medicine_name: str
    quantity: str | None = None
    instructions: str | None = None
    medicine_master_id: UUID | None = None
    strength: str | None = None


@dataclass(frozen=True, slots=True)
class PrescriptionContext:
    prescription_id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    items: tuple[PrescriptionItemContext, ...]


@dataclass(frozen=True, slots=True)
class DispenseItemInput:
    medicine_name: str
    quantity: int
    prescription_item_id: UUID | None = None
    medicine_id: UUID | None = None
    batch_id: UUID | None = None
    unit_price: Decimal | None = None
    instructions: str | None = None
    sort_order: int = 0


@dataclass(frozen=True, slots=True)
class CreateDispenseInput:
    status: DispenseStatus
    dispense_type: DispenseType = DispenseType.PRESCRIPTION
    prescription_id: UUID | None = None
    patient_id: UUID | None = None
    notes: str | None = None
    dispensed_by: UUID | None = None
    items: tuple[DispenseItemInput, ...] | None = None


@dataclass(frozen=True, slots=True)
class CreateSupplierInput:
    name: str
    code: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    is_active: bool = True


@dataclass(frozen=True, slots=True)
class UpdateSupplierInput:
    name: str
    code: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    is_active: bool = True


@dataclass(frozen=True, slots=True)
class CreateVendorPaymentInput:
    supplier_id: UUID
    amount: Decimal
    payment_date: date
    payment_method: VendorPaymentMethod
    reference_number: str | None = None
    notes: str | None = None
    created_by: UUID | None = None


@dataclass(frozen=True, slots=True)
class StockReturnInput:
    medicine_id: UUID
    quantity: int
    return_kind: StockReturnKind
    batch_id: UUID | None = None
    notes: str | None = None


@dataclass(frozen=True, slots=True)
class UpdateDispenseInput:
    notes: str | None = None
    items: tuple[DispenseItemInput, ...] = ()


@dataclass(frozen=True, slots=True)
class UpdateDispenseStatusInput:
    status: str
    notes: str | None = None
    dispensed_by: UUID | None = None


@dataclass(frozen=True, slots=True)
class DispensePrintOutput:
    order_number: str
    status: DispenseStatus
    patient_name: str | None
    patient_mrn: str | None
    doctor_name: str | None
    doctor_code: str | None
    consultation_visit_number: str | None
    created_at: datetime
    dispensed_at: date | None
    notes: str | None
    items: tuple[DispenseItemInput, ...]
