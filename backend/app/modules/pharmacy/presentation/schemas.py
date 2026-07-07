from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.pharmacy.application.dto.pharmacy_dto import (
    AdjustStockInput,
    CreateBatchInput,
    CreateDispenseInput,
    CreateMedicineInput,
    DispenseItemInput,
    DispensePrintOutput,
    UpdateBatchInput,
    UpdateDispenseInput,
    UpdateDispenseStatusInput,
    UpdateMedicineInput,
)
from app.modules.pharmacy.domain.entities.dispense_record import (
    DispenseItem,
    DispenseRecord,
    DispenseStatusEvent,
)
from app.modules.pharmacy.domain.entities.pharmacy_batch import PharmacyBatch
from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock
from app.modules.pharmacy.domain.entities.pharmacy_supplier import PharmacySupplier
from app.modules.pharmacy.domain.entities.stock_movement import StockMovement
from app.modules.pharmacy.domain.value_objects import (
    DispensePage,
    DispenseStatus,
    InventoryPage,
    MedicineCategory,
    MedicinePage,
    StockMovementPage,
    StockMovementType,
)


class MedicineCreateRequest(BaseModel):
    medicine_code: str = Field(min_length=1, max_length=30)
    generic_name: str = Field(min_length=1, max_length=200)
    brand_name: str = Field(min_length=1, max_length=200)
    category: MedicineCategory
    mrp: Decimal = Field(ge=0)
    selling_price: Decimal = Field(ge=0)
    gst: Decimal = Field(ge=0, default=Decimal("0"))
    strength: str | None = Field(default=None, max_length=50)
    dosage_form: str | None = Field(default=None, max_length=50)
    manufacturer: str | None = Field(default=None, max_length=200)
    barcode: str | None = Field(default=None, max_length=50)
    is_active: bool = True
    minimum_stock: int = Field(default=0, ge=0)
    maximum_stock: int = Field(default=0, ge=0)

    def to_input(self) -> CreateMedicineInput:
        return CreateMedicineInput(
            medicine_code=self.medicine_code,
            generic_name=self.generic_name,
            brand_name=self.brand_name,
            category=self.category,
            mrp=self.mrp,
            selling_price=self.selling_price,
            gst=self.gst,
            strength=self.strength,
            dosage_form=self.dosage_form,
            manufacturer=self.manufacturer,
            barcode=self.barcode,
            is_active=self.is_active,
            minimum_stock=self.minimum_stock,
            maximum_stock=self.maximum_stock,
        )


class MedicineUpdateRequest(BaseModel):
    generic_name: str = Field(min_length=1, max_length=200)
    brand_name: str = Field(min_length=1, max_length=200)
    category: MedicineCategory
    mrp: Decimal = Field(ge=0)
    selling_price: Decimal = Field(ge=0)
    gst: Decimal = Field(ge=0, default=Decimal("0"))
    strength: str | None = Field(default=None, max_length=50)
    dosage_form: str | None = Field(default=None, max_length=50)
    manufacturer: str | None = Field(default=None, max_length=200)
    barcode: str | None = Field(default=None, max_length=50)
    is_active: bool = True

    def to_input(self) -> UpdateMedicineInput:
        return UpdateMedicineInput(
            generic_name=self.generic_name,
            brand_name=self.brand_name,
            category=self.category,
            mrp=self.mrp,
            selling_price=self.selling_price,
            gst=self.gst,
            strength=self.strength,
            dosage_form=self.dosage_form,
            manufacturer=self.manufacturer,
            barcode=self.barcode,
            is_active=self.is_active,
        )


class MedicineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medicine_code: str
    generic_name: str
    brand_name: str
    category: MedicineCategory
    mrp: Decimal
    selling_price: Decimal
    gst: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
    strength: str | None = None
    dosage_form: str | None = None
    manufacturer: str | None = None
    barcode: str | None = None

    @classmethod
    def from_entity(cls, medicine: PharmacyMedicine) -> "MedicineResponse":
        return cls(
            id=medicine.id,
            medicine_code=medicine.medicine_code,
            generic_name=medicine.generic_name,
            brand_name=medicine.brand_name,
            category=medicine.category,
            mrp=medicine.mrp,
            selling_price=medicine.selling_price,
            gst=medicine.gst,
            is_active=medicine.is_active,
            created_at=medicine.created_at,
            updated_at=medicine.updated_at,
            strength=medicine.strength,
            dosage_form=medicine.dosage_form,
            manufacturer=medicine.manufacturer,
            barcode=medicine.barcode,
        )


class MedicineListResponse(BaseModel):
    items: list[MedicineResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: MedicinePage) -> "MedicineListResponse":
        return cls(
            items=[MedicineResponse.from_entity(m) for m in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class BatchCreateRequest(BaseModel):
    medicine_id: UUID
    batch_number: str = Field(min_length=1, max_length=50)
    expiry_date: date
    quantity: int = Field(ge=0)
    purchase_price: Decimal = Field(ge=0)
    selling_price: Decimal = Field(ge=0)
    supplier_id: UUID | None = None

    def to_input(self) -> CreateBatchInput:
        return CreateBatchInput(
            medicine_id=self.medicine_id,
            batch_number=self.batch_number,
            expiry_date=self.expiry_date,
            quantity=self.quantity,
            purchase_price=self.purchase_price,
            selling_price=self.selling_price,
            supplier_id=self.supplier_id,
        )


class BatchUpdateRequest(BaseModel):
    batch_number: str = Field(min_length=1, max_length=50)
    expiry_date: date
    quantity: int = Field(ge=0)
    purchase_price: Decimal = Field(ge=0)
    selling_price: Decimal = Field(ge=0)
    supplier_id: UUID | None = None

    def to_input(self) -> UpdateBatchInput:
        return UpdateBatchInput(
            batch_number=self.batch_number,
            expiry_date=self.expiry_date,
            quantity=self.quantity,
            purchase_price=self.purchase_price,
            selling_price=self.selling_price,
            supplier_id=self.supplier_id,
        )


class BatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medicine_id: UUID
    batch_number: str
    expiry_date: date
    quantity: int
    purchase_price: Decimal
    selling_price: Decimal
    created_at: datetime
    supplier_id: UUID | None = None
    supplier_name: str | None = None
    medicine_name: str | None = None

    @classmethod
    def from_entity(cls, batch: PharmacyBatch) -> "BatchResponse":
        return cls(
            id=batch.id,
            medicine_id=batch.medicine_id,
            batch_number=batch.batch_number,
            expiry_date=batch.expiry_date,
            quantity=batch.quantity,
            purchase_price=batch.purchase_price,
            selling_price=batch.selling_price,
            created_at=batch.created_at,
            supplier_id=batch.supplier_id,
            supplier_name=batch.supplier_name,
            medicine_name=batch.medicine_name,
        )


class StockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medicine_id: UUID
    current_stock: int
    reserved_stock: int
    available_stock: int
    minimum_stock: int
    maximum_stock: int
    is_low_stock: bool
    updated_at: datetime
    medicine_code: str | None = None
    generic_name: str | None = None
    brand_name: str | None = None
    category: str | None = None

    @classmethod
    def from_entity(cls, stock: PharmacyMedicineStock) -> "StockResponse":
        return cls(
            id=stock.id,
            medicine_id=stock.medicine_id,
            current_stock=stock.current_stock,
            reserved_stock=stock.reserved_stock,
            available_stock=stock.available_stock,
            minimum_stock=stock.minimum_stock,
            maximum_stock=stock.maximum_stock,
            is_low_stock=stock.is_low_stock,
            updated_at=stock.updated_at,
            medicine_code=stock.medicine_code,
            generic_name=stock.generic_name,
            brand_name=stock.brand_name,
            category=stock.category,
        )


class InventoryListResponse(BaseModel):
    items: list[StockResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: InventoryPage) -> "InventoryListResponse":
        return cls(
            items=[StockResponse.from_entity(s) for s in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class AdjustStockRequest(BaseModel):
    medicine_id: UUID
    quantity_delta: int
    notes: str | None = Field(default=None, max_length=2000)
    batch_id: UUID | None = None

    def to_input(self) -> AdjustStockInput:
        return AdjustStockInput(
            medicine_id=self.medicine_id,
            quantity_delta=self.quantity_delta,
            notes=self.notes,
            batch_id=self.batch_id,
        )


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medicine_id: UUID
    movement_type: StockMovementType
    quantity_delta: int
    created_at: datetime
    batch_id: UUID | None = None
    reference_type: str | None = None
    reference_id: UUID | None = None
    notes: str | None = None
    created_by: UUID | None = None
    medicine_name: str | None = None
    batch_number: str | None = None

    @classmethod
    def from_entity(cls, movement: StockMovement) -> "StockMovementResponse":
        return cls(
            id=movement.id,
            medicine_id=movement.medicine_id,
            movement_type=movement.movement_type,
            quantity_delta=movement.quantity_delta,
            created_at=movement.created_at,
            batch_id=movement.batch_id,
            reference_type=movement.reference_type,
            reference_id=movement.reference_id,
            notes=movement.notes,
            created_by=movement.created_by,
            medicine_name=movement.medicine_name,
            batch_number=movement.batch_number,
        )


class StockMovementListResponse(BaseModel):
    items: list[StockMovementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: StockMovementPage) -> "StockMovementListResponse":
        return cls(
            items=[StockMovementResponse.from_entity(m) for m in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class AdjustStockResponse(BaseModel):
    stock: StockResponse
    movement: StockMovementResponse


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    is_active: bool
    created_at: datetime
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None

    @classmethod
    def from_entity(cls, supplier: PharmacySupplier) -> "SupplierResponse":
        return cls(
            id=supplier.id,
            name=supplier.name,
            is_active=supplier.is_active,
            created_at=supplier.created_at,
            contact_person=supplier.contact_person,
            phone=supplier.phone,
            email=supplier.email,
            address=supplier.address,
        )


class DispenseItemRequest(BaseModel):
    prescription_item_id: UUID | None = None
    medicine_id: UUID | None = None
    batch_id: UUID | None = None
    medicine_name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(ge=1)
    unit_price: Decimal | None = Field(default=None, ge=0)
    instructions: str | None = Field(default=None, max_length=2000)
    sort_order: int = 0

    def to_input(self) -> DispenseItemInput:
        return DispenseItemInput(
            prescription_item_id=self.prescription_item_id,
            medicine_id=self.medicine_id,
            batch_id=self.batch_id,
            medicine_name=self.medicine_name,
            quantity=self.quantity,
            unit_price=self.unit_price,
            instructions=self.instructions,
            sort_order=self.sort_order,
        )


class DispenseCreateRequest(BaseModel):
    prescription_id: UUID
    status: DispenseStatus = DispenseStatus.PENDING
    notes: str | None = Field(default=None, max_length=4000)
    dispensed_by: UUID | None = None
    items: list[DispenseItemRequest] | None = None

    def to_input(self) -> CreateDispenseInput:
        return CreateDispenseInput(
            prescription_id=self.prescription_id,
            status=self.status,
            notes=self.notes,
            dispensed_by=self.dispensed_by,
            items=tuple(item.to_input() for item in self.items) if self.items else None,
        )


class DispenseUpdateRequest(BaseModel):
    notes: str | None = Field(default=None, max_length=4000)
    items: list[DispenseItemRequest] = Field(min_length=1)

    def to_input(self) -> UpdateDispenseInput:
        return UpdateDispenseInput(
            notes=self.notes,
            items=tuple(item.to_input() for item in self.items),
        )


class DispenseStatusUpdateRequest(BaseModel):
    status: DispenseStatus
    notes: str | None = Field(default=None, max_length=2000)
    dispensed_by: UUID | None = None

    def to_input(self) -> UpdateDispenseStatusInput:
        return UpdateDispenseStatusInput(
            status=self.status.value,
            notes=self.notes,
            dispensed_by=self.dispensed_by,
        )


class DispenseItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    dispense_id: UUID
    medicine_name: str
    quantity: int
    sort_order: int
    prescription_item_id: UUID | None = None
    medicine_id: UUID | None = None
    batch_id: UUID | None = None
    unit_price: Decimal | None = None
    instructions: str | None = None

    @classmethod
    def from_entity(cls, item: DispenseItem) -> "DispenseItemResponse":
        return cls(
            id=item.id,
            dispense_id=item.dispense_id,
            medicine_name=item.medicine_name,
            quantity=item.quantity,
            sort_order=item.sort_order,
            prescription_item_id=item.prescription_item_id,
            medicine_id=item.medicine_id,
            batch_id=item.batch_id,
            unit_price=item.unit_price,
            instructions=item.instructions,
        )


class DispenseStatusEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    dispense_id: UUID
    status: DispenseStatus
    notes: str | None
    changed_at: datetime

    @classmethod
    def from_entity(cls, event: DispenseStatusEvent) -> "DispenseStatusEventResponse":
        return cls(
            id=event.id,
            dispense_id=event.dispense_id,
            status=event.status,
            notes=event.notes,
            changed_at=event.changed_at,
        )


class DispenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    prescription_id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    order_number: str
    status: DispenseStatus
    created_at: datetime
    updated_at: datetime
    dispensed_by: UUID | None = None
    notes: str | None = None
    dispensed_at: datetime | None = None
    items: list[DispenseItemResponse] = []
    status_history: list[DispenseStatusEventResponse] = []
    patient_name: str | None = None
    patient_mrn: str | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    consultation_visit_number: str | None = None

    @classmethod
    def from_entity(cls, dispense: DispenseRecord) -> "DispenseResponse":
        return cls(
            id=dispense.id,
            prescription_id=dispense.prescription_id,
            consultation_id=dispense.consultation_id,
            patient_id=dispense.patient_id,
            doctor_id=dispense.doctor_id,
            order_number=dispense.order_number,
            status=dispense.status,
            created_at=dispense.created_at,
            updated_at=dispense.updated_at,
            dispensed_by=dispense.dispensed_by,
            notes=dispense.notes,
            dispensed_at=dispense.dispensed_at,
            items=[DispenseItemResponse.from_entity(i) for i in (dispense.items or [])],
            status_history=[
                DispenseStatusEventResponse.from_entity(e) for e in (dispense.status_history or [])
            ],
            patient_name=dispense.patient_name,
            patient_mrn=dispense.patient_mrn,
            doctor_name=dispense.doctor_name,
            doctor_code=dispense.doctor_code,
            consultation_visit_number=dispense.consultation_visit_number,
        )


class DispenseListResponse(BaseModel):
    items: list[DispenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: DispensePage) -> "DispenseListResponse":
        return cls(
            items=[DispenseResponse.from_entity(d) for d in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class DispensePrintItemResponse(BaseModel):
    medicine_name: str
    quantity: int
    unit_price: Decimal | None = None
    instructions: str | None = None


class DispensePrintResponse(BaseModel):
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
    items: list[DispensePrintItemResponse]

    @classmethod
    def from_output(cls, output: DispensePrintOutput) -> "DispensePrintResponse":
        return cls(
            order_number=output.order_number,
            status=output.status,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            doctor_name=output.doctor_name,
            doctor_code=output.doctor_code,
            consultation_visit_number=output.consultation_visit_number,
            created_at=output.created_at,
            dispensed_at=output.dispensed_at,
            notes=output.notes,
            items=[
                DispensePrintItemResponse(
                    medicine_name=item.medicine_name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    instructions=item.instructions,
                )
                for item in output.items
            ],
        )
