"""
Passenger startup file for cPanel environments that expect a WSGI callable.

FastAPI is ASGI, so we wrap it with a WSGI adapter for compatibility.
"""

import os
import sys

from a2wsgi import ASGIMiddleware

BASE_DIR = os.path.dirname(__file__)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app  # noqa: E402

# cPanel Passenger entry point (WSGI callable)
application = ASGIMiddleware(app)
