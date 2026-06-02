from __future__ import annotations

import os
import threading
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy.orm import declarative_base, sessionmaker

DEFAULT_DATABASE_URL = "sqlite:///./clinical_mastery.db"


def _strip_wrapping_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1].strip()
    return value


def _normalize_database_url(raw_database_url: str | None = None) -> str:
    """Return a SQLAlchemy-compatible database URL.

    cPanel forms are easy to mis-fill. This accepts the intended SQLAlchemy URL,
    strips accidental whitespace/quotes, and also accepts a raw absolute SQLite
    file path such as `/home/user/apps/project/data/app.db` by converting it to
    `sqlite:////home/user/apps/project/data/app.db`.
    """

    database_url = _strip_wrapping_quotes(raw_database_url or DEFAULT_DATABASE_URL)
    if not database_url:
        database_url = DEFAULT_DATABASE_URL

    if database_url.startswith("~/"):
        database_url = str(Path(database_url).expanduser())

    if database_url.startswith("/"):
        database_url = f"sqlite:///{database_url}"

    try:
        make_url(database_url)
    except ArgumentError as exc:
        raise ValueError(
            "Invalid DATABASE_URL. For cPanel SQLite use exactly: "
            "sqlite:////home/<cpanel_user>/apps/clinical-mastery/data/clinical_mastery.db. "
            "Do not include spaces, backticks, or the variable name itself. "
            f"Received: {database_url!r}"
        ) from exc

    return database_url


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL"))


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
