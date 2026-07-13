"""API workflow helpers for integration tests."""

from __future__ import annotations

from httpx import AsyncClient

from tests.factories import (
    AppointmentPayloadFactory,
    DoctorPayloadFactory,
    LabOrderItemPayloadFactory,
    PatientPayloadFactory,
    PrescriptionItemPayloadFactory,
    RadiologyOrderItemPayloadFactory,
)


async def create_patient(client: AsyncClient, headers: dict[str, str], **overrides: object) -> dict:
    payload = PatientPayloadFactory(**overrides)
    response = await client.post("/api/v1/patients", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


async def create_doctor(client: AsyncClient, headers: dict[str, str], **overrides: object) -> dict:
    payload = DoctorPayloadFactory(**overrides)
    response = await client.post("/api/v1/doctors", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


async def create_appointment(
    client: AsyncClient,
    headers: dict[str, str],
    patient_id: str,
    doctor_id: str,
    **overrides: object,
) -> dict:
    payload = AppointmentPayloadFactory(patient_id=patient_id, doctor_id=doctor_id, **overrides)
    response = await client.post("/api/v1/appointments", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


async def create_consultation(
    client: AsyncClient,
    headers: dict[str, str],
    appointment_id: str,
) -> dict:
    response = await client.post(
        "/api/v1/consultations",
        json={"appointment_id": appointment_id},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


async def create_clinical_chain(client: AsyncClient, headers: dict[str, str]) -> dict:
    patient = await create_patient(client, headers)
    doctor = await create_doctor(client, headers)
    appointment = await create_appointment(client, headers, patient["id"], doctor["id"])
    consultation = await create_consultation(client, headers, appointment["id"])
    return {
        "patient": patient,
        "doctor": doctor,
        "appointment": appointment,
        "consultation": consultation,
    }


def prescription_payload(consultation_id: str) -> dict:
    return {
        "consultation_id": consultation_id,
        "diagnosis": "Viral fever",
        "advice": "Rest and hydration",
        "items": [PrescriptionItemPayloadFactory()],
    }


def lab_order_payload(consultation_id: str) -> dict:
    return {
        "consultation_id": consultation_id,
        "priority": "routine",
        "clinical_notes": "Routine panel",
        "items": [LabOrderItemPayloadFactory()],
    }


def radiology_order_payload(consultation_id: str) -> dict:
    return {
        "consultation_id": consultation_id,
        "priority": "routine",
        "clinical_notes": "Rule out pneumonia",
        "items": [RadiologyOrderItemPayloadFactory()],
    }
