from app.infrastructure.models.user import UserModel
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.value_objects import (
    AdmissionStatus,
    AdmissionType,
    BedStatus,
    WardType,
)
from app.modules.ipd.infrastructure.models.ipd_model import (
    IpdAdmissionModel,
    IpdBedModel,
    IpdWardModel,
)
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def ward_to_entity(model: IpdWardModel) -> Ward:
    return Ward(
        id=model.id,
        code=model.code,
        name=model.name,
        ward_type=WardType(model.ward_type),
        floor=model.floor,
        is_active=model.is_active,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
    )


def bed_to_entity(model: IpdBedModel, ward: IpdWardModel | None = None) -> Bed:
    return Bed(
        id=model.id,
        ward_id=model.ward_id,
        bed_number=model.bed_number,
        status=BedStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        ward_code=ward.code if ward else None,
        ward_name=ward.name if ward else None,
        ward_type=ward.ward_type if ward else None,
        ward_floor=ward.floor if ward else None,
    )


def admission_to_entity(
    model: IpdAdmissionModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
    bed: IpdBedModel | None = None,
    ward: IpdWardModel | None = None,
    discharged_by_user: UserModel | None = None,
) -> Admission:
    return Admission(
        id=model.id,
        admission_number=model.admission_number,
        patient_id=model.patient_id,
        consultation_id=model.consultation_id,
        admitting_doctor_id=model.admitting_doctor_id,
        bed_id=model.bed_id,
        admission_date=model.admission_date,
        expected_discharge_date=model.expected_discharge_date,
        admission_type=AdmissionType(model.admission_type),
        status=AdmissionStatus(model.status),
        chief_complaint=model.chief_complaint,
        diagnosis=model.diagnosis,
        notes=model.notes,
        discharged_at=model.discharged_at,
        discharge_summary=model.discharge_summary,
        discharged_by=model.discharged_by,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        patient_name=_patient_display_name(patient) if patient else None,
        patient_mrn=patient.mrn if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
        consultation_visit_number=consultation.visit_number if consultation else None,
        bed_number=bed.bed_number if bed else None,
        ward_name=ward.name if ward else None,
        discharged_by_name=discharged_by_user.full_name if discharged_by_user else None,
    )
