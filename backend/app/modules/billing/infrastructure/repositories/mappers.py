from app.modules.billing.domain.entities.billing_entities import (
    InsuranceClaim,
    Invoice,
    InvoiceItem,
    InvoiceStatusEvent,
    Payment,
)
from app.modules.billing.domain.value_objects import (
    BillingDepartment,
    ClaimStatus,
    InvoiceStatus,
    PaymentMethod,
    ReferenceType,
)
from app.modules.billing.infrastructure.models.billing_model import (
    InsuranceClaimModel,
    InvoiceItemModel,
    InvoiceModel,
    InvoiceStatusEventModel,
    PaymentModel,
)
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel


def _patient_display_name(patient: PatientModel) -> str:
    parts = [patient.first_name, patient.middle_name, patient.last_name]
    return " ".join(part for part in parts if part).strip()


def invoice_item_to_entity(model: InvoiceItemModel) -> InvoiceItem:
    return InvoiceItem(
        id=model.id,
        invoice_id=model.invoice_id,
        service_name=model.service_name,
        department=BillingDepartment(model.department),
        quantity=model.quantity,
        unit_price=model.unit_price,
        discount_amount=model.discount_amount,
        tax_amount=model.tax_amount,
        total_amount=model.total_amount,
        sort_order=model.sort_order,
        reference_type=ReferenceType(model.reference_type) if model.reference_type else None,
        reference_id=model.reference_id,
    )


def invoice_item_to_model(item: InvoiceItem) -> InvoiceItemModel:
    return InvoiceItemModel(
        id=item.id,
        invoice_id=item.invoice_id,
        service_name=item.service_name,
        department=item.department.value,
        quantity=item.quantity,
        unit_price=item.unit_price,
        discount_amount=item.discount_amount,
        tax_amount=item.tax_amount,
        total_amount=item.total_amount,
        sort_order=item.sort_order,
        reference_type=item.reference_type.value if item.reference_type else None,
        reference_id=item.reference_id,
    )


def payment_to_entity(model: PaymentModel) -> Payment:
    return Payment(
        id=model.id,
        invoice_id=model.invoice_id,
        payment_number=model.payment_number,
        amount=model.amount,
        payment_method=PaymentMethod(model.payment_method),
        reference_number=model.reference_number,
        collected_by=model.collected_by,
        payment_date=model.payment_date,
        notes=model.notes,
        created_at=model.created_at,
    )


def payment_to_model(payment: Payment) -> PaymentModel:
    return PaymentModel(
        id=payment.id,
        invoice_id=payment.invoice_id,
        payment_number=payment.payment_number,
        amount=payment.amount,
        payment_method=payment.payment_method.value,
        reference_number=payment.reference_number,
        collected_by=payment.collected_by,
        payment_date=payment.payment_date,
        notes=payment.notes,
    )


def insurance_claim_to_entity(model: InsuranceClaimModel) -> InsuranceClaim:
    return InsuranceClaim(
        id=model.id,
        invoice_id=model.invoice_id,
        claim_number=model.claim_number,
        insurer_name=model.insurer_name,
        status=ClaimStatus(model.status),
        claimed_amount=model.claimed_amount,
        approved_amount=model.approved_amount,
        notes=model.notes,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def invoice_status_event_to_entity(model: InvoiceStatusEventModel) -> InvoiceStatusEvent:
    return InvoiceStatusEvent(
        id=model.id,
        invoice_id=model.invoice_id,
        status=InvoiceStatus(model.status),
        notes=model.notes,
        changed_at=model.changed_at,
    )


def invoice_status_event_to_model(event: InvoiceStatusEvent) -> InvoiceStatusEventModel:
    return InvoiceStatusEventModel(
        id=event.id,
        invoice_id=event.invoice_id,
        status=event.status.value,
        notes=event.notes,
        changed_at=event.changed_at,
    )


def invoice_to_entity(
    model: InvoiceModel,
    patient: PatientModel | None = None,
    doctor: DoctorModel | None = None,
    consultation: ConsultationModel | None = None,
) -> Invoice:
    return Invoice(
        id=model.id,
        invoice_number=model.invoice_number,
        consultation_id=model.consultation_id,
        patient_id=model.patient_id,
        doctor_id=model.doctor_id,
        invoice_date=model.invoice_date,
        status=InvoiceStatus(model.status),
        subtotal=model.subtotal,
        discount_amount=model.discount_amount,
        tax_amount=model.tax_amount,
        grand_total=model.grand_total,
        paid_amount=model.paid_amount,
        balance=model.balance,
        notes=model.notes,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        items=[invoice_item_to_entity(item) for item in model.items],
        payments=[payment_to_entity(p) for p in model.payments],
        status_events=[invoice_status_event_to_entity(e) for e in model.status_events],
        insurance_claims=[insurance_claim_to_entity(c) for c in model.insurance_claims],
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
