from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.radiology.domain.entities.radiology_order import (
    RadiologyOrder,
    RadiologyOrderItem,
    RadiologyOrderStatusEvent,
)
from app.modules.radiology.domain.entities.radiology_test_master import RadiologyTestMaster
from app.modules.radiology.domain.value_objects import ImagingCategory, RadiologyPriority, RadiologyStatus
from app.modules.radiology.infrastructure.models.radiology_order_model import (
    RadiologyOrderItemModel,
    RadiologyOrderModel,
    RadiologyOrderStatusEventModel,
    RadiologyTestMasterModel,
)


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def radiology_test_master_to_entity(model: RadiologyTestMasterModel) -> RadiologyTestMaster:
    return RadiologyTestMaster(
        id=model.id,
        test_code=model.test_code,
        test_name=model.test_name,
        category=ImagingCategory(model.category),
        body_part=model.body_part,
        estimated_duration=model.estimated_duration,
        price=model.price,
        is_active=model.is_active,
        created_at=model.created_at,
    )


def radiology_order_status_event_to_entity(
    model: RadiologyOrderStatusEventModel,
) -> RadiologyOrderStatusEvent:
    return RadiologyOrderStatusEvent(
        id=model.id,
        radiology_order_id=model.radiology_order_id,
        status=RadiologyStatus(model.status),
        notes=model.notes,
        changed_at=model.changed_at,
    )


def radiology_order_item_to_entity(model: RadiologyOrderItemModel) -> RadiologyOrderItem:
    return RadiologyOrderItem(
        id=model.id,
        radiology_order_id=model.radiology_order_id,
        radiology_test_master_id=model.radiology_test_master_id,
        test_name=model.test_name,
        category=ImagingCategory(model.category),
        body_part=model.body_part,
        contrast_required=model.contrast_required,
        instructions=model.instructions,
        sort_order=model.sort_order,
    )


def radiology_order_item_to_model(item: RadiologyOrderItem) -> RadiologyOrderItemModel:
    return RadiologyOrderItemModel(
        id=item.id,
        radiology_order_id=item.radiology_order_id,
        radiology_test_master_id=item.radiology_test_master_id,
        test_name=item.test_name,
        category=item.category.value,
        body_part=item.body_part,
        contrast_required=item.contrast_required,
        instructions=item.instructions,
        sort_order=item.sort_order,
    )


def radiology_order_status_event_to_model(
    event: RadiologyOrderStatusEvent,
) -> RadiologyOrderStatusEventModel:
    return RadiologyOrderStatusEventModel(
        id=event.id,
        radiology_order_id=event.radiology_order_id,
        status=event.status.value,
        notes=event.notes,
        changed_at=event.changed_at,
    )


def radiology_order_to_entity(
    model: RadiologyOrderModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> RadiologyOrder:
    return RadiologyOrder(
        id=model.id,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        order_number=model.order_number,
        priority=RadiologyPriority(model.priority),
        clinical_notes=model.clinical_notes,
        status=RadiologyStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        items=[radiology_order_item_to_entity(item) for item in model.items],
        status_history=[
            radiology_order_status_event_to_entity(event) for event in model.status_history
        ],
        patient_name=_patient_display_name(patient) if patient else None,
        patient_mrn=patient.mrn if patient else None,
        patient_uhid=patient.uhid if patient else None,
        patient_gender=patient.gender if patient else None,
        patient_date_of_birth=patient.date_of_birth if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
        doctor_specialization=doctor.specialization if doctor else None,
        consultation_visit_number=consultation.visit_number if consultation else None,
    )
