"""Passenger startup filename that exposes the plain WSGI application.

Keep this file uploaded on cPanel; some Passenger setups still require this
filename even when the UI is configured to use `cpanel_wsgi.py`.
"""

from wsgi_entry import application
