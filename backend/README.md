# Clinical Mastery Backend API

Backend سیستم آموزش تصمیم‌گیری بالینی با Python WSGI سازگار با cPanel Passenger

## نصب و راه‌اندازی

### 1. نصب Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. اجرای سرور

```bash
python scripts/cpanel_smoke_test.py
```

برای cPanel، Passenger مستقیماً WSGI callable را اجرا می‌کند؛ smoke test بدون اجرای سرور HTTP همان callable را تست می‌کند.

### 3. مشاهده API Documentation

بعد از اجرا، به آدرس‌های زیر بروید:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## ساختار پروژه

```
backend/
├── app/
│   ├── main.py              # compatibility export for WSGI app
│   ├── database.py          # تنظیمات دیتابیس
│   ├── models.py            # مدل‌های SQLAlchemy
│   ├── schemas.py           # Pydantic schemas
│   ├── wsgi.py              # plain synchronous WSGI routes mounted under /api
│   ├── api/                 # compatibility modules
│   └── data/
│       └── seed_cases.py    # داده‌های اولیه
├── cpanel_wsgi.py        # cPanel/Passenger startup file
├── passenger_wsgi.py     # required compatibility filename for some cPanel setups
├── wsgi_entry.py         # shared WSGI application used by both startup files
├── scripts/
│   └── cpanel_smoke_test.py  # Passenger-style WSGI smoke test
├── requirements.txt
└── README.md
```

## API Endpoints

### Cases (کیس‌های بالینی)

- `GET /api/cases/` - دریافت تمام کیس‌ها
- `GET /api/cases/random` - دریافت یک کیس تصادفی
- `GET /api/cases/{case_id}` - دریافت کیس خاص
- `POST /api/cases/` - ایجاد کیس جدید

### Results (نتایج)

- `POST /api/results/` - ذخیره نتیجه یک session
- `GET /api/results/{session_id}` - دریافت نتیجه خاص
- `GET /api/results/` - دریافت آخرین نتایج

### Statistics (آمار)

- `GET /api/stats/summary` - خلاصه آمار کلی
- `GET /api/stats/leaderboard` - لیدربورد برترین امتیازها
- `GET /api/stats/case/{case_id}/stats` - آمار یک کیس خاص

## مثال‌های استفاده

### دریافت کیس تصادفی

```bash
curl http://localhost:8000/api/cases/random
```

### ذخیره نتیجه

```bash
curl -X POST http://localhost:8000/api/results/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "abc123",
    "case_id": 1,
    "total_time": 450,
    "total_questions": 5,
    "correct_answers": 4,
    "wrong_answers": 1,
    "died": false,
    "hints_used": 1
  }'
```

### دریافت آمار

```bash
curl http://localhost:8000/api/stats/summary
```

## دیتابیس

پروژه از SQLite استفاده می‌کند که به صورت خودکار ساخته می‌شود.

برای استفاده از PostgreSQL:

```bash
export DATABASE_URL="postgresql://user:password@localhost/clinical_mastery"
```

## توسعه

### اضافه کردن کیس جدید

کیس‌های جدید را در `app/data/seed_cases.py` اضافه کنید.

### تست API

از Swagger UI در `/docs` استفاده کنید یا:

```bash
pytest tests/
```

## Production Deployment

### با Docker

```bash
docker build -t clinical-mastery-api .
docker run -p 8000:8000 clinical-mastery-api
```

### روی cPanel (Passenger / WSGI)

Passenger به‌صورت پیش‌فرض WSGI اجرا می‌کند. این پروژه فایل‌های آماده‌ی `cpanel_wsgi.py` و `passenger_wsgi.py` دارد که هر دو از `wsgi_entry.py` یک WSGI application مشترک و synchronous می‌گیرند؛ `uvicorn`، event loop، `a2wsgi` یا `ASGIMiddleware` استفاده نمی‌شود.

در cPanel تنظیم کنید:
- **Application startup file**: `cpanel_wsgi.py`
- **Application entry point**: `application`

فایل `passenger_wsgi.py` را پاک نکنید؛ بعضی هاست‌ها حتی با تنظیم `cpanel_wsgi.py` هم وجود این فایل را بررسی می‌کنند.

همه routeهای عمومی زیر `/api` هستند. برای تست شبیه Passenger بعد از فعال‌کردن virtualenv بزنید: `CPANEL_SCRIPT_NAME=/api python scripts/cpanel_smoke_test.py`.

## متغیرهای محیطی

- `DATABASE_URL` - آدرس دیتابیس (پیش‌فرض: SQLite). روی cPanel مقدار نمونه: `sqlite:////home/clinicalexamir/apps/clinical-mastery/data/clinical_mastery.db`
- `CORS_ORIGINS` - لیست originهای مجاز با کاما، مثل `https://clinicalexam.ir`
- `ENVIRONMENT` - محیط اجرا (development/production)

## لایسنس

MIT License
