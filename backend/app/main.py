"""Backend application exports for cPanel Passenger.

`application` is a plain synchronous WSGI callable. It is also exposed as `app`
for older import checks/scripts that expect `app.main:app` to exist.
"""

from app.wsgi import API_MOUNT, application

app = application
