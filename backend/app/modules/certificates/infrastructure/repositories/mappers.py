from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.value_objects import CertificateType
from app.modules.certificates.infrastructure.models.medical_certificate_model import (
    MedicalCertificateModel,
)
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def certificate_to_entity(
    model: MedicalCertificateModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
) -> MedicalCertificate:
    return MedicalCertificate(
        id=model.id,
        certificate_number=model.certificate_number,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        consultation_id=model.consultation_id,
        certificate_type=CertificateType(model.certificate_type),
        issue_date=model.issue_date,
        valid_from=model.valid_from,
        valid_to=model.valid_to,
        diagnosis=model.diagnosis,
        remarks=model.remarks,
        fitness_status=model.fitness_status,
        rest_days=model.rest_days,
        issued_by=model.issued_by,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        patient_name=_patient_display_name(patient) if patient else None,
        patient_mrn=patient.mrn if patient else None,
        doctor_name=doctor.full_name if doctor else None,
        doctor_code=doctor.doctor_code if doctor else None,
    )
