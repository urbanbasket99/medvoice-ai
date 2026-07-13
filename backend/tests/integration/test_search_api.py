"""Global search API integration tests."""

import pytest
from httpx import AsyncClient

from tests.helpers import create_patient

pytestmark = pytest.mark.integration


async def test_global_search(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    patient = await create_patient(client, admin_headers, first_name="FindMe")
    response = await client.get(
        "/api/v1/search",
        params={"q": patient["first_name"]},
        headers=admin_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert "groups" in body
    assert body["query"] == patient["first_name"]


async def test_search_suggestions(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get(
        "/api/v1/search/suggestions",
        params={"q": "test"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert "items" in response.json()


async def test_recent_searches(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    await client.get("/api/v1/search", params={"q": "recent-query"}, headers=admin_headers)
    response = await client.get("/api/v1/search/recent", headers=admin_headers)
    assert response.status_code == 200
    assert "items" in response.json()
