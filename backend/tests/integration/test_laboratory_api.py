"""Laboratory API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_clinical_chain, lab_order_payload

pytestmark = pytest.mark.integration


async def test_list_lab_orders(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/lab-orders", headers=admin_headers)
    assert response.status_code == 200


async def test_list_lab_tests_master(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/lab-tests", headers=admin_headers)
    assert response.status_code == 200


async def test_create_lab_order(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    chain = await create_clinical_chain(client, admin_headers)
    payload = lab_order_payload(chain["consultation"]["id"])
    response = await client.post("/api/v1/lab-orders", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    assert response.json()["consultation_id"] == chain["consultation"]["id"]
