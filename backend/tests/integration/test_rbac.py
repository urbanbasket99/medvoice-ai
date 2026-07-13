"""RBAC authorization integration tests."""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration

PROTECTED_ENDPOINTS = [
    ("GET", "/api/v1/patients"),
    ("GET", "/api/v1/doctors"),
    ("GET", "/api/v1/appointments"),
    ("GET", "/api/v1/consultations"),
    ("GET", "/api/v1/prescriptions"),
    ("GET", "/api/v1/lab-orders"),
    ("GET", "/api/v1/radiology-orders"),
    ("GET", "/api/v1/pharmacy/medicines"),
    ("GET", "/api/v1/billing/invoices"),
    ("GET", "/api/v1/notifications"),
    ("GET", "/api/v1/audit/logs"),
    ("GET", "/api/v1/search?q=test"),
]


@pytest.mark.parametrize("method,path", PROTECTED_ENDPOINTS)
async def test_protected_routes_require_authentication(
    client: AsyncClient, method: str, path: str
) -> None:
    response = await client.request(method, path)
    assert response.status_code == 401


@pytest.mark.parametrize("method,path", PROTECTED_ENDPOINTS)
async def test_admin_can_access_protected_routes(
    client: AsyncClient, admin_headers: dict[str, str], method: str, path: str
) -> None:
    response = await client.request(method, path, headers=admin_headers)
    assert response.status_code in {200, 422}, response.text


async def test_user_without_permissions_gets_forbidden(
    client_as_limited_user: AsyncClient,
) -> None:
    response = await client_as_limited_user.get("/api/v1/patients")
    assert response.status_code == 403
