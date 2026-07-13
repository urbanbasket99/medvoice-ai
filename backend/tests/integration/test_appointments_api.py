"""Appointments API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_appointment, create_doctor, create_patient

pytestmark = pytest.mark.integration


async def test_list_appointments(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/appointments", headers=admin_headers)
    assert response.status_code == 200


async def test_create_appointment(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    patient = await create_patient(client, admin_headers)
    doctor = await create_doctor(client, admin_headers)
    appointment = await create_appointment(client, admin_headers, patient["id"], doctor["id"])
    response = await client.get(
        f"/api/v1/appointments/{appointment['id']}",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["appointment_number"] == appointment["appointment_number"]
