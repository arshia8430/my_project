"""Runtime configuration helpers for the Clinical Mastery WSGI backend."""

from __future__ import annotations

import os
from functools import lru_cache


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> dict[str, object]:
    """Return process settings read from environment variables."""

    return {
        "cors_origins": _parse_csv(os.getenv("CORS_ORIGINS")) or ["*"],
        "environment": os.getenv("ENVIRONMENT", "development"),
    }
