import asyncio

from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository
from app.modules.audit.domain.repositories.audit_log_repository import AuditLogRepository
from app.modules.audit.domain.value_objects import AuditLogListCriteria, SortDirection
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.consultations.domain.repositories.consultation_repository import ConsultationRepository
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.patients.domain.repositories.patient_repository import PatientRepository
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.search.domain.providers.search_index_provider import SearchIndexProvider
from app.modules.search.domain.value_objects import SearchCategory, SearchResultDTO
from app.modules.search.infrastructure.highlight import pick_highlight


def _result(
    *,
    entity_id,
    category: SearchCategory,
    title: str,
    subtitle: str,
    description: str,
    route: str,
    query: str,
    highlight_fields: tuple[str | None, ...],
) -> SearchResultDTO:
    return SearchResultDTO(
        id=str(entity_id),
        category=category,
        title=title,
        subtitle=subtitle,
        description=description,
        route=route,
        highlight=pick_highlight(query, *highlight_fields),
    )


class PatientSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.PATIENTS
    permission_code = "patients:read"

    def __init__(self, repository: PatientRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_patients(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=patient.id,
                category=self.category,
                title=patient.full_name,
                subtitle=f"MRN {patient.mrn} · UHID {patient.uhid}",
                description=patient.mobile,
                route=f"/patients/{patient.id}",
                query=query,
                highlight_fields=(patient.full_name, patient.mrn, patient.uhid, patient.mobile, patient.email),
            )
            for patient in page.items
        ]


class DoctorSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.DOCTORS
    permission_code = "doctors:read"

    def __init__(self, repository: DoctorRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_doctors(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=doctor.id,
                category=self.category,
                title=doctor.full_name,
                subtitle=f"{doctor.doctor_code} · {doctor.specialization}",
                description=doctor.mobile,
                route=f"/doctors/{doctor.id}",
                query=query,
                highlight_fields=(
                    doctor.full_name,
                    doctor.doctor_code,
                    doctor.registration_number,
                    doctor.specialization,
                    doctor.mobile,
                    doctor.email,
                ),
            )
            for doctor in page.items
        ]


class AppointmentSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.APPOINTMENTS
    permission_code = "appointments:read"

    def __init__(self, repository: AppointmentRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_appointments(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=appointment.id,
                category=self.category,
                title=appointment.appointment_number,
                subtitle=f"{appointment.patient_name or 'Patient'} · {appointment.doctor_name or 'Doctor'}",
                description=appointment.chief_complaint or appointment.status.value,
                route=f"/appointments/{appointment.id}",
                query=query,
                highlight_fields=(
                    appointment.appointment_number,
                    appointment.patient_name,
                    appointment.patient_uhid,
                    appointment.doctor_name,
                    appointment.doctor_code,
                    appointment.chief_complaint,
                    appointment.room,
                ),
            )
            for appointment in page.items
        ]


class ConsultationSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.CONSULTATIONS
    permission_code = "consultations:read"

    def __init__(self, repository: ConsultationRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_consultations(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=consultation.id,
                category=self.category,
                title=consultation.visit_number,
                subtitle=f"{consultation.patient_name or 'Patient'} · {consultation.doctor_name or 'Doctor'}",
                description=consultation.diagnosis or consultation.chief_complaint or consultation.status.value,
                route=f"/consultations/{consultation.id}",
                query=query,
                highlight_fields=(
                    consultation.visit_number,
                    consultation.patient_name,
                    consultation.patient_mrn,
                    consultation.patient_uhid,
                    consultation.doctor_name,
                    consultation.diagnosis,
                    consultation.chief_complaint,
                ),
            )
            for consultation in page.items
        ]


class PrescriptionSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.PRESCRIPTIONS
    permission_code = "prescriptions:read"

    def __init__(self, repository: PrescriptionRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_prescriptions(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=prescription.id,
                category=self.category,
                title=prescription.patient_name or "Prescription",
                subtitle=f"{prescription.patient_mrn or 'MRN'} · {prescription.doctor_name or 'Doctor'}",
                description=prescription.diagnosis or prescription.advice or "Prescription record",
                route=f"/prescriptions/{prescription.id}",
                query=query,
                highlight_fields=(
                    prescription.patient_name,
                    prescription.patient_mrn,
                    prescription.doctor_name,
                    prescription.diagnosis,
                    prescription.advice,
                ),
            )
            for prescription in page.items
        ]


class LaboratoryOrderSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.LABORATORY_ORDERS
    permission_code = "laboratory:read"

    def __init__(self, repository: LabOrderRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_lab_orders(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=order.id,
                category=self.category,
                title=order.order_number,
                subtitle=f"{order.patient_name or 'Patient'} · {order.status.value}",
                description=order.clinical_notes or "Laboratory order",
                route=f"/laboratory/orders/{order.id}",
                query=query,
                highlight_fields=(
                    order.order_number,
                    order.patient_name,
                    order.patient_mrn,
                    order.doctor_name,
                    order.clinical_notes,
                ),
            )
            for order in page.items
        ]


class RadiologyOrderSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.RADIOLOGY_ORDERS
    permission_code = "radiology:read"

    def __init__(self, repository: RadiologyOrderRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_radiology_orders(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=order.id,
                category=self.category,
                title=order.order_number,
                subtitle=f"{order.patient_name or 'Patient'} · {order.status.value}",
                description=order.clinical_notes or "Radiology order",
                route=f"/radiology/orders/{order.id}",
                query=query,
                highlight_fields=(
                    order.order_number,
                    order.patient_name,
                    order.patient_mrn,
                    order.doctor_name,
                    order.clinical_notes,
                ),
            )
            for order in page.items
        ]


class MedicineSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.MEDICINES
    permission_code = "pharmacy:read"

    def __init__(self, repository: PharmacyMedicineRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_medicines(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=medicine.id,
                category=self.category,
                title=medicine.brand_name,
                subtitle=f"{medicine.medicine_code} · {medicine.generic_name}",
                description=medicine.strength or medicine.dosage_form or "Pharmacy medicine",
                route="/pharmacy/medicines",
                query=query,
                highlight_fields=(
                    medicine.brand_name,
                    medicine.generic_name,
                    medicine.medicine_code,
                    medicine.barcode,
                ),
            )
            for medicine in page.items
        ]


class InvoiceSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.INVOICES
    permission_code = "billing:read"

    def __init__(self, repository: InvoiceRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.search_invoices(query, page=1, page_size=limit)
        return [
            _result(
                entity_id=invoice.id,
                category=self.category,
                title=invoice.invoice_number,
                subtitle=f"{invoice.patient_name or 'Patient'} · {invoice.status.value}",
                description=invoice.notes or f"Balance {invoice.balance}",
                route=f"/billing/invoices/{invoice.id}",
                query=query,
                highlight_fields=(
                    invoice.invoice_number,
                    invoice.patient_name,
                    invoice.patient_mrn,
                    invoice.patient_uhid,
                    invoice.consultation_visit_number,
                    invoice.notes,
                ),
            )
            for invoice in page.items
        ]


class AuditLogSearchIndexProvider(SearchIndexProvider):
    category = SearchCategory.AUDIT_LOGS
    permission_code = "audit:read"

    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        page = await self._repository.list(
            AuditLogListCriteria(page=1, page_size=limit, sort_dir=SortDirection.DESC, q=query)
        )
        return [
            _result(
                entity_id=log.id,
                category=self.category,
                title=f"{log.module} · {log.action.value}",
                subtitle=log.user_name or "System",
                description=log.description,
                route=f"/audit/logs/{log.id}",
                query=query,
                highlight_fields=(log.description, log.user_name, log.module, log.entity, log.request_id),
            )
            for log in page.items
        ]
