"""Pure functions converting `DoctorModel` rows to `Doctor` domain entities."""

from app.modules.doctors.domain.entities.doctor import Department, Doctor, DoctorStatus, Gender
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel


def doctor_to_entity(model: DoctorModel) -> Doctor:
    return Doctor(
        id=model.id,
        doctor_code=model.doctor_code,
        full_name=model.full_name,
        gender=Gender(model.gender),
        date_of_birth=model.date_of_birth,
        department=Department(model.department),
        specialization=model.specialization,
        qualification=model.qualification,
        registration_number=model.registration_number,
        experience_years=model.experience_years,
        mobile=model.mobile,
        joining_date=model.joining_date,
        status=DoctorStatus(model.status),
        created_at=model.created_at,
        updated_at=model.updated_at,
        email=model.email,
        address=model.address,
        languages_spoken=list(model.languages_spoken) if model.languages_spoken else [],
        consultation_fee=model.consultation_fee,
        working_hours=model.working_hours,
        photo_url=model.photo_url,
        deleted_at=model.deleted_at,
    )
