"""Factory Boy payload factories for API integration tests."""

from __future__ import annotations

from datetime import date, time, timedelta

import factory

from app.modules.laboratory.domain.value_objects import LabPriority, SampleType
from app.modules.pharmacy.domain.value_objects import MedicineCategory
from app.modules.prescriptions.domain.value_objects import Frequency, Route
from app.modules.radiology.domain.value_objects import ImagingCategory, RadiologyPriority


class PatientPayloadFactory(factory.DictFactory):
    first_name = factory.Sequence(lambda n: f"Test{n}")
    last_name = "Patient"
    date_of_birth = date(1990, 1, 15)
    gender = "male"
    blood_group = "O+"
    mobile = factory.Sequence(lambda n: f"98765{n:05d}")
    email = factory.Sequence(lambda n: f"patient{n}@test.medvoice.local")
    city = "Hyderabad"


class DoctorPayloadFactory(factory.DictFactory):
    full_name = factory.Sequence(lambda n: f"Dr. Test {n}")
    gender = "male"
    date_of_birth = date(1980, 6, 1)
    department = "general_medicine"
    specialization = "Internal Medicine"
    qualification = "MBBS, MD"
    registration_number = factory.Sequence(lambda n: f"REG-{n:06d}")
    experience_years = 10
    mobile = factory.Sequence(lambda n: f"91234{n:05d}")
    email = factory.Sequence(lambda n: f"doctor{n}@test.medvoice.local")


class AppointmentPayloadFactory(factory.DictFactory):
    department = "general_medicine"
    appointment_date = factory.LazyFunction(lambda: date.today() + timedelta(days=1))
    appointment_time = time(10, 30)
    duration_minutes = 30
    appointment_type = "new"
    priority = "normal"
    chief_complaint = "Routine checkup"


class PrescriptionItemPayloadFactory(factory.DictFactory):
    medicine_name = "Paracetamol"
    strength = "500mg"
    dosage = "1 tablet"
    frequency = Frequency.OD.value
    route = Route.ORAL.value
    duration = "5 days"
    quantity = "5"
    sort_order = 0


class LabOrderItemPayloadFactory(factory.DictFactory):
    lab_test_name = "Complete Blood Count"
    category = "hematology"
    sample_type = SampleType.BLOOD.value
    sort_order = 0


class RadiologyOrderItemPayloadFactory(factory.DictFactory):
    test_name = "Chest X-Ray"
    category = ImagingCategory.XRAY.value
    body_part = "chest"
    contrast_required = False
    sort_order = 0


class MedicinePayloadFactory(factory.DictFactory):
    medicine_code = factory.Sequence(lambda n: f"MED-{n:05d}")
    generic_name = "Paracetamol"
    brand_name = factory.Sequence(lambda n: f"Brand-{n}")
    category = MedicineCategory.TABLET.value
    mrp = "10.00"
    selling_price = "8.00"
    gst = "0.00"


class InvoiceItemPayloadFactory(factory.DictFactory):
    service_name = "Consultation Fee"
    department = "consultation"
    quantity = 1
    unit_price = "500.00"
    discount_amount = "0.00"
    tax_amount = "0.00"
    sort_order = 0


class NotificationPayloadFactory(factory.DictFactory):
    title = factory.Sequence(lambda n: f"Test notification {n}")
    message = "Integration test notification body"
    notification_type = "system_alert"
    severity = "information"
