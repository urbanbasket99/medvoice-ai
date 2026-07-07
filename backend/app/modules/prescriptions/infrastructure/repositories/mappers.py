from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.prescriptions.domain.entities.medicine_master import MedicineMaster
from app.modules.prescriptions.domain.entities.prescription import Prescription, PrescriptionItem
from app.modules.prescriptions.domain.value_objects import (
    DosageInstruction,
    Duration,
    Frequency,
    Route,
)
from app.modules.prescriptions.infrastructure.models.medicine_master_model import MedicineMasterModel
from app.modules.prescriptions.infrastructure.models.prescription_model import (
    PrescriptionItemModel,
    PrescriptionModel,
)


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def _dosage_instruction_from_model(model: PrescriptionItemModel) -> DosageInstruction:
    return DosageInstruction(
        morning=model.morning,
        afternoon=model.afternoon,
        night=model.night,
        before_food=model.before_food,
        after_food=model.after_food,
    )


def prescription_item_to_entity(model: PrescriptionItemModel) -> PrescriptionItem:
    return PrescriptionItem(
        id=model.id,
        prescription_id=model.prescription_id,
        medicine_master_id=model.medicine_master_id,
        medicine_name=model.medicine_name,
        strength=model.strength,
        dosage=model.dosage,
        frequency=Frequency(model.frequency),
        route=Route(model.route),
        duration=Duration(model.duration) if model.duration else None,
        quantity=model.quantity,
        instructions=model.instructions,
        sort_order=model.sort_order,
        dosage_instruction=_dosage_instruction_from_model(model),
    )


def prescription_item_to_model(item: PrescriptionItem) -> PrescriptionItemModel:
    dosage = item.dosage_instruction or DosageInstruction()
    return PrescriptionItemModel(
        id=item.id,
        prescription_id=item.prescription_id,
        medicine_master_id=item.medicine_master_id,
        medicine_name=item.medicine_name,
        strength=item.strength,
        dosage=item.dosage,
        frequency=item.frequency.value,
        route=item.route.value,
        duration=item.duration.value if item.duration else None,
        quantity=item.quantity,
        instructions=item.instructions,
        sort_order=item.sort_order,
        morning=dosage.morning,
        afternoon=dosage.afternoon,
        night=dosage.night,
        before_food=dosage.before_food,
        after_food=dosage.after_food,
    )


def medicine_master_to_entity(model: MedicineMasterModel) -> MedicineMaster:
    return MedicineMaster(
        id=model.id,
        name=model.name,
        created_at=model.created_at,
        generic_name=model.generic_name,
        strength=model.strength,
        form=model.form,
        default_route=Route(model.default_route) if model.default_route else None,
        manufacturer=model.manufacturer,
        is_active=model.is_active,
    )


def prescription_to_entity(
    model: PrescriptionModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> Prescription:
    return Prescription(
        id=model.id,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        diagnosis=model.diagnosis,
        advice=model.advice,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        items=[prescription_item_to_entity(item) for item in model.items],
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
