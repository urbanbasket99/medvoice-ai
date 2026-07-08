from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession
from app.modules.appointments.infrastructure.repositories.sqlalchemy_appointment_repository import (
    SqlAlchemyAppointmentRepository,
)
from app.modules.audit.infrastructure.repositories.sqlalchemy_audit_log_repository import (
    SqlAlchemyAuditLogRepository,
)
from app.modules.billing.infrastructure.repositories.sqlalchemy_invoice_repository import (
    SqlAlchemyInvoiceRepository,
)
from app.modules.consultations.infrastructure.repositories.sqlalchemy_consultation_repository import (
    SqlAlchemyConsultationRepository,
)
from app.modules.doctors.infrastructure.repositories.sqlalchemy_doctor_repository import (
    SqlAlchemyDoctorRepository,
)
from app.modules.laboratory.infrastructure.repositories.sqlalchemy_lab_order_repository import (
    SqlAlchemyLabOrderRepository,
)
from app.modules.patients.infrastructure.repositories.sqlalchemy_patient_repository import (
    SqlAlchemyPatientRepository,
)
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_pharmacy_medicine_repository import (
    SqlAlchemyPharmacyMedicineRepository,
)
from app.modules.prescriptions.infrastructure.repositories.sqlalchemy_prescription_repository import (
    SqlAlchemyPrescriptionRepository,
)
from app.modules.radiology.infrastructure.repositories.sqlalchemy_radiology_order_repository import (
    SqlAlchemyRadiologyOrderRepository,
)
from app.modules.search.application.services.search_service import SearchService
from app.modules.search.domain.repositories.search_repository import SearchRepository
from app.modules.search.infrastructure.models.recent_search_model import RecentSearchStore
from app.modules.search.infrastructure.providers.search_index_providers import (
    AppointmentSearchIndexProvider,
    AuditLogSearchIndexProvider,
    ConsultationSearchIndexProvider,
    DoctorSearchIndexProvider,
    InvoiceSearchIndexProvider,
    LaboratoryOrderSearchIndexProvider,
    MedicineSearchIndexProvider,
    PatientSearchIndexProvider,
    PrescriptionSearchIndexProvider,
    RadiologyOrderSearchIndexProvider,
)
from app.modules.search.infrastructure.repositories.sqlalchemy_search_repository import (
    SqlAlchemySearchRepository,
)


def get_search_repository(db: DbSession) -> SearchRepository:
    recent_store = RecentSearchStore(db)
    providers = [
        PatientSearchIndexProvider(SqlAlchemyPatientRepository(db)),
        DoctorSearchIndexProvider(SqlAlchemyDoctorRepository(db)),
        AppointmentSearchIndexProvider(SqlAlchemyAppointmentRepository(db)),
        ConsultationSearchIndexProvider(SqlAlchemyConsultationRepository(db)),
        PrescriptionSearchIndexProvider(SqlAlchemyPrescriptionRepository(db)),
        LaboratoryOrderSearchIndexProvider(SqlAlchemyLabOrderRepository(db)),
        RadiologyOrderSearchIndexProvider(SqlAlchemyRadiologyOrderRepository(db)),
        MedicineSearchIndexProvider(SqlAlchemyPharmacyMedicineRepository(db)),
        InvoiceSearchIndexProvider(SqlAlchemyInvoiceRepository(db)),
        AuditLogSearchIndexProvider(SqlAlchemyAuditLogRepository(db)),
    ]
    return SqlAlchemySearchRepository(providers, recent_store)


def get_search_service(
    repository: Annotated[SearchRepository, Depends(get_search_repository)],
) -> SearchService:
    return SearchService(repository)


SearchServiceDep = Annotated[SearchService, Depends(get_search_service)]
