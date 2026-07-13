from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.laboratory.domain.entities.lab_order import LabOrder, LabOrderItem, LabOrderStatusEvent
from app.modules.laboratory.domain.entities.lab_test_master import LabTestMaster
from app.modules.laboratory.domain.value_objects import LabPriority, LabStatus, ResultFlag, SampleType
from app.modules.laboratory.infrastructure.models.lab_order_model import (
    LabOrderItemModel,
    LabOrderModel,
    LabOrderStatusEventModel,
    LabTestMasterModel,
)
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def lab_test_master_to_entity(model: LabTestMasterModel) -> LabTestMaster:
    return LabTestMaster(
        id=model.id,
        test_code=model.test_code,
        test_name=model.test_name,
        department=model.department,
        sample_type=SampleType(model.sample_type),
        normal_turnaround_time=model.normal_turnaround_time,
        price=model.price,
        is_active=model.is_active,
        created_at=model.created_at,
    )


def lab_order_status_event_to_entity(model: LabOrderStatusEventModel) -> LabOrderStatusEvent:
    return LabOrderStatusEvent(
        id=model.id,
        lab_order_id=model.lab_order_id,
        status=LabStatus(model.status),
        notes=model.notes,
        changed_at=model.changed_at,
    )


def lab_order_item_to_entity(model: LabOrderItemModel) -> LabOrderItem:
    return LabOrderItem(
        id=model.id,
        lab_order_id=model.lab_order_id,
        lab_test_master_id=model.lab_test_master_id,
        lab_test_name=model.lab_test_name,
        category=model.category,
        sample_type=SampleType(model.sample_type),
        instructions=model.instructions,
        sort_order=model.sort_order,
        result_value=model.result_value,
        result_unit=model.result_unit,
        reference_range=model.reference_range,
        result_flag=ResultFlag(model.result_flag) if model.result_flag else None,
        result_notes=model.result_notes,
        resulted_at=model.resulted_at,
        resulted_by=model.resulted_by,
        sample_barcode=model.sample_barcode,
    )


def lab_order_item_to_model(item: LabOrderItem) -> LabOrderItemModel:
    return LabOrderItemModel(
        id=item.id,
        lab_order_id=item.lab_order_id,
        lab_test_master_id=item.lab_test_master_id,
        lab_test_name=item.lab_test_name,
        category=item.category,
        sample_type=item.sample_type.value,
        instructions=item.instructions,
        sort_order=item.sort_order,
        result_value=item.result_value,
        result_unit=item.result_unit,
        reference_range=item.reference_range,
        result_flag=item.result_flag.value if item.result_flag else None,
        result_notes=item.result_notes,
        resulted_at=item.resulted_at,
        resulted_by=item.resulted_by,
        sample_barcode=item.sample_barcode,
    )


def lab_order_status_event_to_model(event: LabOrderStatusEvent) -> LabOrderStatusEventModel:
    return LabOrderStatusEventModel(
        id=event.id,
        lab_order_id=event.lab_order_id,
        status=event.status.value,
        notes=event.notes,
        changed_at=event.changed_at,
    )


def lab_order_to_entity(
    model: LabOrderModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> LabOrder:
    return LabOrder(
        id=model.id,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        order_number=model.order_number,
        priority=LabPriority(model.priority),
        clinical_notes=model.clinical_notes,
        status=LabStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        items=[lab_order_item_to_entity(item) for item in model.items],
        status_history=[lab_order_status_event_to_entity(event) for event in model.status_history],
        patient_name=_patient_display_name(patient) if patient else None,
        patient_mrn=patient.mrn if patient else None,
        patient_uhid=patient.uhid if patient else None,
        patient_gender=patient.gender if patient else None,
        patient_date_of_birth=patient.date_of_birth if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
        doctor_specialization=doctor.specialization if doctor else None,
        consultation_visit_number=consultation.visit_number if consultation else None,
        is_partial_report=model.is_partial_report,
    )
