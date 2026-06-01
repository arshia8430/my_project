"""Smoke test the cPanel/Passenger WSGI entrypoint without running a server.

Run this on the cPanel host after activating the Python App virtualenv:

    cd ~/apps/clinical-mastery/backend
    python scripts/cpanel_smoke_test.py

For a same-domain Python App mounted at https://example.com/api, use:

    API_PREFIX= CPANEL_SCRIPT_NAME=/api python scripts/cpanel_smoke_test.py

For a dedicated API subdomain/root, use:

    API_PREFIX=/api python scripts/cpanel_smoke_test.py
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
from pathlib import Path
from typing import Iterable

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def _load_application():
    from cpanel_wsgi import application
    from app.main import API_PREFIX

    return application, API_PREFIX


def _call_wsgi(application, path: str, script_name: str = "") -> tuple[int, dict[str, str], bytes]:
    captured: dict[str, object] = {}

    def start_response(status: str, headers: list[tuple[str, str]], exc_info=None):
        captured["status"] = status
        captured["headers"] = headers
        return None

    environ = {
        "REQUEST_METHOD": "GET",
        "SCRIPT_NAME": script_name,
        "PATH_INFO": path,
        "QUERY_STRING": "",
        "SERVER_NAME": "localhost",
        "SERVER_PORT": "443",
        "SERVER_PROTOCOL": "HTTP/1.1",
        "wsgi.version": (1, 0),
        "wsgi.url_scheme": "https",
        "wsgi.input": io.BytesIO(b""),
        "wsgi.errors": sys.stderr,
        "wsgi.multithread": True,
        "wsgi.multiprocess": False,
        "wsgi.run_once": False,
    }

    result: Iterable[bytes] = application(environ, start_response)
    try:
        body = b"".join(result)
    finally:
        close = getattr(result, "close", None)
        if close is not None:
            close()

    status_text = str(captured.get("status", "500 WSGI start_response not called"))
    status_code = int(status_text.split()[0])
    headers = {key.lower(): value for key, value in captured.get("headers", [])}
    return status_code, headers, body


def _assert_json_ok(application, path: str, script_name: str = "") -> dict:
    status, headers, body = _call_wsgi(application, path, script_name)
    content_type = headers.get("content-type", "")
    if status != 200:
        raise AssertionError(f"GET {script_name}{path} returned {status}: {body[:500]!r}")
    if "application/json" not in content_type:
        raise AssertionError(
            f"GET {script_name}{path} returned non-JSON content-type {content_type!r}: {body[:500]!r}"
        )
    return json.loads(body.decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--script-name",
        default=os.getenv("CPANEL_SCRIPT_NAME", ""),
        help="WSGI SCRIPT_NAME used by Passenger for path-mounted apps, e.g. /api",
    )
    args = parser.parse_args()

    application, api_prefix = _load_application()
    script_name = args.script_name.rstrip("/")
    api_path = f"{api_prefix}/cases/random" if api_prefix else "/cases/random"

    print(f"Loaded cpanel_wsgi.application successfully")
    print(f"API_PREFIX={api_prefix!r}; SCRIPT_NAME={script_name!r}")

    health = _assert_json_ok(application, "/health", script_name)
    print(f"/health ok: {health}")

    db_health = _assert_json_ok(application, "/health/db", script_name)
    print(f"/health/db ok: {db_health}")

    random_case = _assert_json_ok(application, api_path, script_name)
    print(f"{api_path} ok: case_id={random_case.get('case_id')!r}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
