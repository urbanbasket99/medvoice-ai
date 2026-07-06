"""Pure functions converting `PatientModel` rows to `Patient` domain entities."""

from app.modules.patients.domain.entities.patient import (
    BloodGroup,
    Gender,
    MaritalStatus,
    Patient,
    PatientStatus,
)
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def patient_to_entity(model: PatientModel) -> Patient:
    return Patient(
        id=model.id,
        mrn=model.mrn,
        uhid=model.uhid,
        first_name=model.first_name,
        middle_name=model.middle_name,
        last_name=model.last_name,
        date_of_birth=model.date_of_birth,
        gender=Gender(model.gender),
        mobile=model.mobile,
        status=PatientStatus(model.status),
        registration_date=model.registration_date,
        created_at=model.created_at,
        updated_at=model.updated_at,
        blood_group=BloodGroup(model.blood_group) if model.blood_group else None,
        marital_status=MaritalStatus(model.marital_status) if model.marital_status else None,
        occupation=model.occupation,
        alternate_mobile=model.alternate_mobile,
        email=model.email,
        address_line1=model.address_line1,
        address_line2=model.address_line2,
        city=model.city,
        state=model.state,
        country=model.country,
        postal_code=model.postal_code,
        emergency_name=model.emergency_name,
        emergency_relation=model.emergency_relation,
        emergency_mobile=model.emergency_mobile,
        insurance_provider=model.insurance_provider,
        insurance_number=model.insurance_number,
        allergies=model.allergies,
        chronic_conditions=model.chronic_conditions,
        notes=model.notes,
        created_by=model.created_by,
        updated_by=model.updated_by,
        deleted_at=model.deleted_at,
    )
