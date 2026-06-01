"""Shared plain WSGI entrypoint for cPanel/Passenger.

No ASGI server, event loop, or ASGI-to-WSGI adapter is used. Both cPanel startup
filenames import this synchronous WSGI `application` object.
"""

from app.wsgi import application
