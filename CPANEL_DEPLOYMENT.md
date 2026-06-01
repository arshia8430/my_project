# cPanel Deployment Guide (Frontend + FastAPI Backend)

This guide explains how to deploy this project to a cPanel-hosted server when you have manual access to both File Manager and the cPanel dashboard.

## 1) Understand the architecture

- **Frontend**: Vite/React static files (`npm run build` output in `dist/`).
- **Backend**: FastAPI app (`backend/app`) run by **Setup Python App** in cPanel through Passenger/WSGI (`backend/cpanel_wsgi.py`).
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

RewriteRule ^api($|/) - [L]

RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

This ensures React routes work on refresh while leaving `/api` requests available for the cPanel Python App when you mount the backend on the same domain path.

## 5) Upload backend code

1. In File Manager, create a directory outside public web root, for example:
   - `/home/<cpanel_user>/apps/clinical-mastery/backend`
2. Upload the `backend/` folder contents into it.

## 6) Create Python app in cPanel

1. Go to **cPanel → Setup Python App**.
2. Click **Create Application**:
   - Python version: `3.10.18` (recommended by your hosting panel) or the highest available stable version.
   - Application root: `apps/clinical-mastery/backend`
   - Application URL: choose one of these layouts:
     - Dedicated API subdomain root: `api.yourdomain.com/`
     - Same-domain path: `yourdomain.com/api`
   - Application startup file: `cpanel_wsgi.py`
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

## 8) cPanel startup file (required for FastAPI)

The backend includes `cpanel_wsgi.py` in the backend app root. Use this file in **Setup Python App**:

```text
Application startup file: cpanel_wsgi.py
Application entry point: application
```

Passenger expects a **WSGI callable** named `application`, but FastAPI is **ASGI**. `cpanel_wsgi.py` wraps FastAPI with `a2wsgi.ASGIMiddleware`.

Do **not** set the cPanel startup file to `passenger_wsgi.py` on hosts that generate a Passenger wrapper. Some panels create a `passenger_wsgi.py` wrapper internally; selecting that same file as the startup target can make it import itself repeatedly and end in `RecursionError: maximum recursion depth exceeded`.

## 9) Configure environment variables

In **Setup Python App**, add environment variables:

- `DATABASE_URL=sqlite:////home/<cpanel_user>/apps/clinical-mastery/data/clinical_mastery.db`
- `ENVIRONMENT=production`
- `PYTHONUNBUFFERED=1`
- `API_PREFIX=/api` when the Python App is mounted on a dedicated API subdomain/root
- `API_PREFIX=` (empty value) when the Python App URL itself is `yourdomain.com/api`; if your panel does not allow an empty value, use `API_PREFIX=/`

Create data dir once:

```bash
mkdir -p ~/apps/clinical-mastery/data
```

## 10) Connect frontend to backend URL

The backend API route prefix is controlled by the `API_PREFIX` environment variable.

- Dedicated API subdomain/root, e.g. `https://api.example.com`:
  - Backend env: `API_PREFIX=/api`
  - Frontend build env: `VITE_API_URL=https://api.example.com/api`

- Same-domain cPanel path, e.g. Python App URL `https://example.com/api`:
  - Backend env: `API_PREFIX=` (empty; or `API_PREFIX=/` if cPanel rejects empty values)
  - Frontend build env: `VITE_API_URL=https://example.com/api`

Then rebuild the frontend and re-upload `dist/` contents.

## 11) CORS settings

If frontend and backend are on different origins, set `CORS_ORIGINS` in cPanel, for example `CORS_ORIGINS=https://clinicalexam.ir`, then restart the Python App.

## 12) Restart app and verify

In **Setup Python App**, click **Restart**.

Health check URLs:
- Dedicated subdomain/root: `https://api.example.com/health`
- Same-domain path mount: `https://example.com/api/health`

Database health check:
- Dedicated subdomain/root: `https://api.example.com/health/db`
- Same-domain path mount: `https://example.com/api/health/db`

Verify API endpoints:
- Dedicated subdomain/root with `API_PREFIX=/api`: `GET https://api.example.com/api/cases/random`
- Same-domain path mount with `API_PREFIX=`: `GET https://example.com/api/cases/random`

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

## 15) Timeout troubleshooting commands

Run these from cPanel Terminal after activating the Python virtualenv:

```bash
cd ~/apps/clinical-mastery/backend
python -c "from cpanel_wsgi import application; print('wsgi ok')"
python -c "from app.main import app; print(app.title)"
API_PREFIX= CPANEL_SCRIPT_NAME=/api python scripts/cpanel_smoke_test.py
curl -i --max-time 20 https://example.com/api/health
curl -i --max-time 20 https://example.com/api/health/db
```

Expected results:
- `wsgi ok` means cPanel can import the same startup module that Passenger uses.
- `scripts/cpanel_smoke_test.py` calls `cpanel_wsgi.application` directly like Passenger, verifies `/health`, verifies `/health/db`, seeds/reads a random case, and fails if the response is not JSON/200.
- `/health` should respond even if the database has a problem.
- `/health/db` verifies SQLite path, permissions, table creation, and migrations.

If logs show `RecursionError: maximum recursion depth exceeded` with `imp.load_source(..., 'passenger_wsgi.py')`, the cPanel startup file is wrong. Set **Application startup file** to `cpanel_wsgi.py`, not `passenger_wsgi.py`, then restart the Python App.
