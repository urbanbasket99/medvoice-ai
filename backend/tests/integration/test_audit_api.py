"""Audit logs API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_patient

pytestmark = pytest.mark.integration


async def test_list_audit_logs(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/audit/logs", headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    assert "items" in body


async def test_audit_logs_record_mutations(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    await create_patient(client, admin_headers)
    response = await client.get(
        "/api/v1/audit/logs",
        params={"module": "patients"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["total"] >= 1


async def test_audit_filter_options(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/audit/logs/filters", headers=admin_headers)
    assert response.status_code == 200
    assert "modules" in response.json()
