"""Centralized, environment-driven application configuration.

All settings are declared here with explicit types so misconfiguration is
caught at startup (fail-fast) rather than at first use. Nothing in this
module talks to the database or the framework layer — it is pure
configuration, safe to import from any layer.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "MedVoice AI HMS"
    app_env: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://medvoice:medvoice@localhost:5432/medvoice-ai"
    )

    # JWT
    jwt_secret_key: str = Field(default="change-me-to-a-long-random-secret-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Refresh token cookie
    refresh_token_cookie_name: str = "refresh_token"
    refresh_token_cookie_path: str = "/api/v1/auth"
    refresh_token_cookie_domain: str | None = None
    refresh_token_cookie_secure: bool = False
    refresh_token_cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    # Password hashing
    bcrypt_rounds: int = 12

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor — safe to call repeatedly (e.g. as a FastAPI dependency)."""
    return Settings()
