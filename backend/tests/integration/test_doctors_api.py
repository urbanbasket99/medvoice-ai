"""Doctors API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_doctor

pytestmark = pytest.mark.integration


async def test_list_doctors(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/doctors", headers=admin_headers)
    assert response.status_code == 200
    assert "items" in response.json()


async def test_create_and_get_doctor(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    created = await create_doctor(client, admin_headers)
    response = await client.get(f"/api/v1/doctors/{created['id']}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["doctor_code"] == created["doctor_code"]
