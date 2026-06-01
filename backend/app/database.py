from __future__ import annotations

import os
import threading
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clinical_mastery.db")


def _sqlite_path_from_url(database_url: str) -> str | None:
    """Extract a filesystem path from a SQLite SQLAlchemy URL."""

    if database_url.startswith("sqlite:////"):
        return "/" + database_url.removeprefix("sqlite:////")
    if database_url.startswith("sqlite:///"):
        return database_url.removeprefix("sqlite:///")
    return None


def _ensure_sqlite_parent_dir(database_url: str) -> None:
    sqlite_path = _sqlite_path_from_url(database_url)
    if not sqlite_path or sqlite_path == ":memory:":
        return

    parent = Path(sqlite_path).expanduser().parent
    if str(parent) not in {"", "."}:
        parent.mkdir(parents=True, exist_ok=True)


_ensure_sqlite_parent_dir(DATABASE_URL)

connect_args = (
    {"check_same_thread": False, "timeout": 15}
    if DATABASE_URL.startswith("sqlite")
    else {}
)
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_init_lock = threading.Lock()
_initialized = False


def initialize_database() -> None:
    """Create and lightly migrate database tables once per process.

    This is intentionally not executed at module import time. Passenger/cPanel
    should be able to import the WSGI app quickly; database setup runs lazily
    before DB-backed endpoints and can be diagnosed through `/health/db`.
    """

    global _initialized
    if _initialized:
        return

    with _init_lock:
        if _initialized:
            return

        from app.models import Case, Result  # noqa: F401

        Base.metadata.create_all(bind=engine)
        _ensure_case_columns()
        _initialized = True


def _ensure_case_columns() -> None:
    if not DATABASE_URL.startswith("sqlite"):
        return

    with engine.begin() as conn:
        cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(cases)")).fetchall()
        }
        if "icd10_code" not in cols:
            conn.execute(
                text("ALTER TABLE cases ADD COLUMN icd10_code VARCHAR NOT NULL DEFAULT 'R69'")
            )
        if "case_type" not in cols:
            conn.execute(
                text("ALTER TABLE cases ADD COLUMN case_type VARCHAR NOT NULL DEFAULT 'clinic'")
            )
        if "created_at" not in cols:
            conn.execute(
                text("ALTER TABLE cases ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
            )


def check_database() -> None:
    initialize_database()
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))


def get_db():
    initialize_database()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
