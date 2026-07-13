"""Pharmacy API integration tests."""

import pytest
from httpx import AsyncClient

from tests.factories import MedicinePayloadFactory

pytestmark = pytest.mark.integration


async def test_list_pharmacy_medicines(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/pharmacy/medicines", headers=admin_headers)
    assert response.status_code == 200


async def test_create_pharmacy_medicine(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    payload = MedicinePayloadFactory()
    response = await client.post("/api/v1/pharmacy/medicines", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    assert response.json()["medicine_code"] == payload["medicine_code"]


async def test_list_dispenses(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/pharmacy/dispenses", headers=admin_headers)
    assert response.status_code == 200
