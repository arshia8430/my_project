"""Case route logic lives in the plain WSGI app (`app.wsgi`).

This module is kept as a compatibility import location for older tooling; it no
longer registers FastAPI/ASGI routes.
"""

from app.wsgi import _handle_cases as handle_cases  # noqa: F401
from app.wsgi import _seed_cases as seed_cases  # noqa: F401
