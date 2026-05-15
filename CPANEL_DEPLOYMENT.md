# cPanel Deployment Guide (Frontend + FastAPI Backend)

This guide explains how to deploy this project to a cPanel-hosted server when you have manual access to both File Manager and the cPanel dashboard.

## 1) Understand the architecture

- **Frontend**: Vite/React static files (`npm run build` output in `dist/`).
- **Backend**: FastAPI app (`backend/app`) run by `uvicorn` through **Python App** in cPanel.
- **Database**: SQLite file on server disk (or switch to MySQL/PostgreSQL for production-scale traffic).

## 2) Requirements on hosting

You need:
- cPanel with **Setup Python App** (CloudLinux Passenger or similar).
- Python 3.10+ available in cPanel.
- Ability to run terminal commands (Terminal in cPanel or SSH).
- A domain or subdomain for frontend (e.g., `example.com`) and optional subdomain for API (e.g., `api.example.com`).

## 3) Build frontend locally

From project root:

```bash
npm ci
npm run build
```

This creates a `dist/` folder.

## 4) Upload frontend to cPanel

1. Open **cPanel → File Manager**.
2. Go to `public_html/` (or your subdomain document root).
3. Delete default placeholder files if needed.
4. Upload contents of local `dist/` into that folder.

### SPA routing fix (.htaccess)

Create/edit `.htaccess` in the same frontend web root:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

This ensures React routes work on refresh.

## 5) Upload backend code

1. In File Manager, create a directory outside public web root, for example:
   - `/home/<cpanel_user>/apps/clinical-mastery/backend`
2. Upload the `backend/` folder contents into it.

## 6) Create Python app in cPanel

1. Go to **cPanel → Setup Python App**.
2. Click **Create Application**:
   - Python version: `3.11` (or highest supported).
   - Application root: `apps/clinical-mastery/backend`
   - Application URL: choose `/api` path or `api.yourdomain.com`.
   - Application startup file: `passenger_wsgi.py`
   - Application entry point: `application`
3. Create app.

## 7) Install backend dependencies

Open cPanel Terminal (or SSH):

```bash
cd ~/apps/clinical-mastery/backend
source <venv_path_from_cpanel>/bin/activate
pip install -r requirements.txt
```

> Use the exact virtual environment path shown by cPanel Python App page.

## 8) Add Passenger entry file

Create `passenger_wsgi.py` in backend app root (`~/apps/clinical-mastery/backend`):

```python
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.main import app as application
```

## 9) Configure environment variables

In **Setup Python App**, add environment variables:

- `DATABASE_URL=sqlite:////home/<cpanel_user>/apps/clinical-mastery/data/clinical_mastery.db`
- `ENVIRONMENT=production`
- (optional) `PYTHONUNBUFFERED=1`

Create data dir once:

```bash
mkdir -p ~/apps/clinical-mastery/data
```

## 10) Connect frontend to backend URL

If backend is at `/api`, set frontend build-time variable before build:

```bash
VITE_API_URL=/api npm run build
```

If backend is at subdomain (recommended), e.g. `https://api.example.com/api`:

```bash
VITE_API_URL=https://api.example.com/api npm run build
```

Then re-upload `dist/` contents.

## 11) CORS settings

If frontend and backend are on different origins, update backend CORS allowlist in `backend/app/main.py` (replace wildcard with your frontend domain), then redeploy/restart.

## 12) Restart app and verify

In **Setup Python App**, click **Restart**.

Health check URL:
- `https://api.example.com/health` or `https://example.com/api/health`

Verify API endpoints:
- `GET /api/cases/random`
- `GET /api/stats/summary`

Verify frontend:
- Open site and start a case.
- Confirm browser network calls return 200.

## 13) Updating deployment

1. Upload new frontend `dist/` files.
2. Upload backend changed files.
3. `pip install -r requirements.txt` if deps changed.
4. Restart Python app in cPanel.

## 14) Production hardening checklist

- Do not keep wildcard CORS in production.
- Use stronger admin credentials via env vars:
  - `VITE_ADMIN_USERNAME`
  - `VITE_ADMIN_PASSWORD`
- Back up SQLite DB regularly or migrate to MySQL/PostgreSQL.
- Enable HTTPS and force SSL in cPanel.
- Keep Python packages updated with pinned versions.
