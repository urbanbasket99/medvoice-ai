"""Consultations API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_clinical_chain

pytestmark = pytest.mark.integration


async def test_list_consultations(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/consultations", headers=admin_headers)
    assert response.status_code == 200


async def test_create_consultation_from_appointment(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    chain = await create_clinical_chain(client, admin_headers)
    response = await client.get(
        f"/api/v1/consultations/{chain['consultation']['id']}",
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["appointment_id"] == chain["appointment"]["id"]
