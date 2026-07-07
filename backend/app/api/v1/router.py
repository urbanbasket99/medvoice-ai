"""Aggregates all v1 routers into a single `APIRouter`."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.modules.doctors.presentation.router import router as doctors_router
from app.modules.patients.presentation.router import router as patients_router
from app.modules.appointments.presentation.router import router as appointments_router
from app.modules.consultations.presentation.router import router as consultations_router
from app.modules.voice.presentation.router import router as voice_router
from app.modules.ai.presentation.router import router as ai_router
from app.modules.transcriptions.presentation.router import router as transcriptions_router
from app.modules.prescriptions.presentation.router import router as prescriptions_router
from app.modules.prescriptions.presentation.medicines_router import router as medicines_router
from app.modules.laboratory.presentation.router import router as lab_orders_router
from app.modules.laboratory.presentation.lab_tests_router import router as lab_tests_router
from app.modules.radiology.presentation.router import router as radiology_orders_router
from app.modules.radiology.presentation.radiology_tests_router import router as radiology_tests_router
from app.modules.pharmacy.presentation.medicines_router import router as pharmacy_medicines_router
from app.modules.pharmacy.presentation.batches_router import router as pharmacy_batches_router
from app.modules.pharmacy.presentation.stock_router import router as pharmacy_stock_router
from app.modules.pharmacy.presentation.dispenses_router import router as pharmacy_dispenses_router
from app.modules.pharmacy.presentation.suppliers_router import router as pharmacy_suppliers_router
from app.modules.billing.presentation.invoices_router import router as billing_invoices_router
from app.modules.billing.presentation.payments_router import router as billing_payments_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(patients_router)
api_v1_router.include_router(doctors_router)
api_v1_router.include_router(appointments_router)
api_v1_router.include_router(consultations_router)
api_v1_router.include_router(voice_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(transcriptions_router)
api_v1_router.include_router(prescriptions_router)
api_v1_router.include_router(medicines_router)
api_v1_router.include_router(lab_orders_router)
api_v1_router.include_router(lab_tests_router)
api_v1_router.include_router(radiology_orders_router)
api_v1_router.include_router(radiology_tests_router)
api_v1_router.include_router(pharmacy_medicines_router)
api_v1_router.include_router(pharmacy_batches_router)
api_v1_router.include_router(pharmacy_stock_router)
api_v1_router.include_router(pharmacy_dispenses_router)
api_v1_router.include_router(pharmacy_suppliers_router)
api_v1_router.include_router(billing_invoices_router)
api_v1_router.include_router(billing_payments_router)
