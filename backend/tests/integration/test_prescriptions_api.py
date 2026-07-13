"""Prescriptions API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_clinical_chain, prescription_payload

pytestmark = pytest.mark.integration


async def test_list_prescriptions(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/prescriptions", headers=admin_headers)
    assert response.status_code == 200


async def test_create_prescription(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    chain = await create_clinical_chain(client, admin_headers)
    payload = prescription_payload(chain["consultation"]["id"])
    response = await client.post("/api/v1/prescriptions", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["consultation_id"] == chain["consultation"]["id"]
    assert len(body["items"]) == 1
