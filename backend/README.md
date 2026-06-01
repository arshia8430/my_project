# Clinical Mastery Backend API

Backend سیستم آموزش تصمیم‌گیری بالینی با FastAPI و Python

## نصب و راه‌اندازی

### 1. نصب Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. اجرای سرور

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

سرور روی `http://localhost:8000` اجرا می‌شود.

### 3. مشاهده API Documentation

بعد از اجرا، به آدرس‌های زیر بروید:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## ساختار پروژه

```
backend/
├── app/
│   ├── main.py              # نقطه ورود اصلی
│   ├── database.py          # تنظیمات دیتابیس
│   ├── models.py            # مدل‌های SQLAlchemy
│   ├── schemas.py           # Pydantic schemas
│   ├── api/
│   │   ├── cases.py         # API endpoints کیس‌ها
│   │   ├── results.py       # API endpoints نتایج
│   │   └── stats.py         # API endpoints آمار
│   └── data/
│       └── seed_cases.py    # داده‌های اولیه
├── cpanel_wsgi.py        # cPanel/Passenger startup file
├── passenger_wsgi.py     # compatibility import for direct Passenger setups
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

### با Gunicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### روی cPanel (Passenger / WSGI)

Passenger به‌صورت پیش‌فرض WSGI اجرا می‌کند، اما FastAPI از نوع ASGI است. این پروژه فایل آماده‌ی `cpanel_wsgi.py` دارد که FastAPI را با `a2wsgi` برای Passenger آماده می‌کند.

در cPanel تنظیم کنید:
- **Application startup file**: `cpanel_wsgi.py`
- **Application entry point**: `application`

اگر برنامه را روی مسیر `clinicalexam.ir/api` mount می‌کنید، متغیر محیطی `API_PREFIX` را خالی بگذارید (اگر cPanel مقدار خالی قبول نکرد، `/` بگذارید) تا endpoint نهایی `clinicalexam.ir/api/cases/random` شود. اگر برنامه روی ریشه‌ی ساب‌دامین API است، `API_PREFIX=/api` بگذارید. برای تست شبیه Passenger بعد از فعال‌کردن virtualenv بزنید: `API_PREFIX= CPANEL_SCRIPT_NAME=/api python scripts/cpanel_smoke_test.py`.

## متغیرهای محیطی

- `DATABASE_URL` - آدرس دیتابیس (پیش‌فرض: SQLite)
- `API_PREFIX` - پیش‌فرض `/api`; برای cPanel path mount مثل `clinicalexam.ir/api` مقدار را خالی بگذارید
- `CORS_ORIGINS` - لیست originهای مجاز با کاما، مثل `https://clinicalexam.ir`
- `ENVIRONMENT` - محیط اجرا (development/production)

## لایسنس

MIT License
