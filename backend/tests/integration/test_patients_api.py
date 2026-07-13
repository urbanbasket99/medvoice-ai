"""Patients API integration tests."""

import pytest
from httpx import AsyncClient

from tests.factories import PatientPayloadFactory
from tests.helpers import create_patient

pytestmark = pytest.mark.integration


async def test_list_patients(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/patients", headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "total" in body


async def test_create_and_get_patient(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    created = await create_patient(client, admin_headers)
    response = await client.get(f"/api/v1/patients/{created['id']}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


async def test_search_patients(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    patient = await create_patient(client, admin_headers, first_name="Searchable")
    response = await client.get(
        "/api/v1/patients/search",
        params={"q": patient["first_name"]},
        headers=admin_headers,
    )
    assert response.status_code == 200
    ids = [item["id"] for item in response.json()["items"]]
    assert patient["id"] in ids


async def test_create_patient_validation_error(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    payload = PatientPayloadFactory(first_name="")
    response = await client.post("/api/v1/patients", json=payload, headers=admin_headers)
    assert response.status_code == 422
