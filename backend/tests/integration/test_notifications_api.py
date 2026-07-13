"""Notifications API integration tests."""

import pytest
from httpx import AsyncClient

from tests.factories import NotificationPayloadFactory

pytestmark = pytest.mark.integration


async def test_list_notifications(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/notifications", headers=admin_headers)
    assert response.status_code == 200


async def test_unread_count(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    response = await client.get("/api/v1/notifications/unread-count", headers=admin_headers)
    assert response.status_code == 200
    assert "count" in response.json()


async def test_create_notification(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    me = await client.get("/api/v1/auth/me", headers=admin_headers)
    user_id = me.json()["id"]
    payload = NotificationPayloadFactory(user_id=user_id, notification_type="system_alert")
    response = await client.post("/api/v1/notifications", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    assert response.json()["title"] == payload["title"]
