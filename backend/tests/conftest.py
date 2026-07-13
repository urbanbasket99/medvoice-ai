"""Shared pytest configuration for integration tests."""

from __future__ import annotations

import os
import subprocess
import sys
from collections.abc import AsyncGenerator, Generator
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]

# Configure environment before any `app.*` import creates the SQLAlchemy engine.
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DEBUG", "false")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-jwt-secret-key-for-pytest-suite-minimum-length",
)
os.environ.setdefault(
    "DATABASE_URL",
    os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+asyncpg://medvoice:medvoice@localhost:5432/medvoice_test",
    ),
)
os.environ.setdefault("CORS_ORIGINS", "http://testserver")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-not-used-in-integration-tests")
os.environ.setdefault("SEED_ADMIN_EMAIL", "admin@medvoice.com")
os.environ.setdefault("SEED_ADMIN_PASSWORD", "Admin@123")


def _bootstrap_database() -> None:
    env = os.environ.copy()
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        check=True,
        cwd=BACKEND_ROOT,
        env=env,
    )
    subprocess.run(
        [sys.executable, "-m", "app.db.seed"],
        check=True,
        cwd=BACKEND_ROOT,
        env=env,
    )


@pytest.fixture(scope="session")
def database_ready() -> Generator[None, None, None]:
    """Migrate and seed the test database once per pytest session."""
    try:
        _bootstrap_database()
    except subprocess.CalledProcessError as exc:
        pytest.skip(f"PostgreSQL test database unavailable: {exc}")
    yield


@pytest.fixture
async def client(database_ready: None) -> AsyncGenerator[AsyncClient, None]:
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client


@pytest.fixture
async def admin_token(client: AsyncClient) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": os.environ["SEED_ADMIN_EMAIL"], "password": os.environ["SEED_ADMIN_PASSWORD"]},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def limited_user():
    """Authenticated user with no RBAC permissions (for authorization tests)."""
    from app.domain.entities.user import User

    now = datetime.now(UTC)
    return User(
        id=uuid4(),
        email="limited@test.medvoice.local",
        hashed_password="",
        full_name="Limited User",
        is_active=True,
        is_superuser=False,
        created_at=now,
        updated_at=now,
        roles=[],
    )


@pytest.fixture
async def client_as_limited_user(limited_user, database_ready: None) -> AsyncGenerator[AsyncClient, None]:
    from app.api.deps import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: limited_user
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client
    app.dependency_overrides.clear()
