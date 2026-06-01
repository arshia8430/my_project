"""Compatibility Passenger entrypoint.

Prefer `cpanel_wsgi.py` as the cPanel **Application startup file**. This module
remains for hosts that execute `passenger_wsgi.py` directly instead of using it
as a generated wrapper.
"""

from cpanel_wsgi import application
