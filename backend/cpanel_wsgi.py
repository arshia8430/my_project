"""cPanel/Passenger startup module for the FastAPI backend.

Use this file as the **Application startup file** in cPanel's Setup Python App.
Do not point cPanel at `passenger_wsgi.py`; some cPanel installations generate
that file as a wrapper and will recursively import it if it is also selected as
startup file.
"""

from __future__ import annotations

import logging
import os
import sys

from a2wsgi import ASGIMiddleware

BASE_DIR = os.path.dirname(__file__)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))

from app.main import app  # noqa: E402

application = ASGIMiddleware(app)
