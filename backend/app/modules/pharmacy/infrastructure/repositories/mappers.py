from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
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
    DispenseStatus,
    MedicineCategory,
    StockMovementType,
)
from app.modules.pharmacy.infrastructure.models.pharmacy_model import (
    DispenseItemModel,
    DispenseRecordModel,
    DispenseStatusEventModel,
    PharmacyBatchModel,
    PharmacyMedicineModel,
    PharmacyMedicineStockModel,
    PharmacySupplierModel,
    StockMovementModel,
)


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def pharmacy_medicine_to_entity(model: PharmacyMedicineModel) -> PharmacyMedicine:
    return PharmacyMedicine(
        id=model.id,
        medicine_code=model.medicine_code,
        generic_name=model.generic_name,
        brand_name=model.brand_name,
        category=MedicineCategory(model.category),
        mrp=model.mrp,
        selling_price=model.selling_price,
        gst=model.gst,
        is_active=model.is_active,
        created_at=model.created_at,
        updated_at=model.updated_at,
        strength=model.strength,
        dosage_form=model.dosage_form,
        manufacturer=model.manufacturer,
        barcode=model.barcode,
        deleted_at=model.deleted_at,
    )


def pharmacy_supplier_to_entity(model: PharmacySupplierModel) -> PharmacySupplier:
    return PharmacySupplier(
        id=model.id,
        name=model.name,
        is_active=model.is_active,
        created_at=model.created_at,
        contact_person=model.contact_person,
        phone=model.phone,
        email=model.email,
        address=model.address,
    )


def pharmacy_batch_to_entity(
    model: PharmacyBatchModel,
    supplier: PharmacySupplierModel | None = None,
    medicine: PharmacyMedicineModel | None = None,
) -> PharmacyBatch:
    medicine_name = None
    if medicine:
        medicine_name = f"{medicine.brand_name} ({medicine.generic_name})"
    return PharmacyBatch(
        id=model.id,
        medicine_id=model.medicine_id,
        batch_number=model.batch_number,
        expiry_date=model.expiry_date,
        quantity=model.quantity,
        purchase_price=model.purchase_price,
        selling_price=model.selling_price,
        created_at=model.created_at,
        supplier_id=model.supplier_id,
        supplier_name=supplier.name if supplier else None,
        medicine_name=medicine_name,
    )


def pharmacy_stock_to_entity(
    model: PharmacyMedicineStockModel,
    medicine: PharmacyMedicineModel | None = None,
) -> PharmacyMedicineStock:
    return PharmacyMedicineStock(
        id=model.id,
        medicine_id=model.medicine_id,
        current_stock=model.current_stock,
        reserved_stock=model.reserved_stock,
        minimum_stock=model.minimum_stock,
        maximum_stock=model.maximum_stock,
        updated_at=model.updated_at,
        medicine_code=medicine.medicine_code if medicine else None,
        generic_name=medicine.generic_name if medicine else None,
        brand_name=medicine.brand_name if medicine else None,
        category=medicine.category if medicine else None,
    )


def stock_movement_to_entity(
    model: StockMovementModel,
    medicine: PharmacyMedicineModel | None = None,
    batch: PharmacyBatchModel | None = None,
) -> StockMovement:
    medicine_name = None
    if medicine:
        medicine_name = f"{medicine.brand_name} ({medicine.generic_name})"
    return StockMovement(
        id=model.id,
        medicine_id=model.medicine_id,
        movement_type=StockMovementType(model.movement_type),
        quantity_delta=model.quantity_delta,
        created_at=model.created_at,
        batch_id=model.batch_id,
        reference_type=model.reference_type,
        reference_id=model.reference_id,
        notes=model.notes,
        created_by=model.created_by,
        medicine_name=medicine_name,
        batch_number=batch.batch_number if batch else None,
    )


def dispense_status_event_to_entity(model: DispenseStatusEventModel) -> DispenseStatusEvent:
    return DispenseStatusEvent(
        id=model.id,
        dispense_id=model.dispense_id,
        status=DispenseStatus(model.status),
        notes=model.notes,
        changed_at=model.changed_at,
    )


def dispense_item_to_entity(model: DispenseItemModel) -> DispenseItem:
    return DispenseItem(
        id=model.id,
        dispense_id=model.dispense_id,
        prescription_item_id=model.prescription_item_id,
        medicine_id=model.medicine_id,
        batch_id=model.batch_id,
        medicine_name=model.medicine_name,
        quantity=model.quantity,
        unit_price=model.unit_price,
        instructions=model.instructions,
        sort_order=model.sort_order,
    )


def dispense_item_to_model(item: DispenseItem) -> DispenseItemModel:
    return DispenseItemModel(
        id=item.id,
        dispense_id=item.dispense_id,
        prescription_item_id=item.prescription_item_id,
        medicine_id=item.medicine_id,
        batch_id=item.batch_id,
        medicine_name=item.medicine_name,
        quantity=item.quantity,
        unit_price=item.unit_price,
        instructions=item.instructions,
        sort_order=item.sort_order,
    )


def dispense_status_event_to_model(event: DispenseStatusEvent) -> DispenseStatusEventModel:
    return DispenseStatusEventModel(
        id=event.id,
        dispense_id=event.dispense_id,
        status=event.status.value,
        notes=event.notes,
        changed_at=event.changed_at,
    )


def dispense_record_to_entity(
    model: DispenseRecordModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> DispenseRecord:
    return DispenseRecord(
        id=model.id,
        prescription_id=model.prescription_id,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        order_number=model.order_number,
        status=DispenseStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        dispensed_by=model.dispensed_by,
        notes=model.notes,
        dispensed_at=model.dispensed_at,
        deleted_at=model.deleted_at,
        items=[dispense_item_to_entity(item) for item in model.items],
        status_history=[dispense_status_event_to_entity(event) for event in model.status_history],
        patient_name=_patient_display_name(patient) if patient else None,
        patient_mrn=patient.mrn if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
        consultation_visit_number=consultation.visit_number if consultation else None,
    )
