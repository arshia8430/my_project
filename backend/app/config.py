"""Runtime configuration helpers for the Clinical Mastery backend."""

from __future__ import annotations

import os
from functools import lru_cache


def _clean_prefix(prefix: str | None) -> str:
    """Normalize an API prefix from environment variables.

    cPanel often mounts Python apps under a URL path such as `/api`. In that
    layout the external `/api` segment is already consumed by Passenger, so the
    FastAPI routes should usually be mounted at the app root by setting
    `API_PREFIX=`. For local development and dedicated API subdomains, the
    default remains `/api` to preserve existing frontend behavior.
    """

    if prefix is None:
        return "/api"

    prefix = prefix.strip()
    if prefix in {"", "/"}:
        return ""

    return "/" + prefix.strip("/")


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> dict[str, object]:
    """Return process settings read from environment variables."""

    return {
        "api_prefix": _clean_prefix(os.getenv("API_PREFIX", "/api")),
        "cors_origins": _parse_csv(os.getenv("CORS_ORIGINS")) or ["*"],
        "environment": os.getenv("ENVIRONMENT", "development"),
    }
