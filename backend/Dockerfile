FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY scripts ./scripts
COPY cpanel_wsgi.py passenger_wsgi.py wsgi_entry.py ./
CMD ["python", "scripts/cpanel_smoke_test.py"]
