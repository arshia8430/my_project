# 🚀 راهنمای Deploy کامل

## نصب و راه‌اندازی محلی

### پیش‌نیازها
- Python 3.11+
- Node.js 18+
- pnpm

### 1️⃣ راه‌اندازی Backend

```bash
cd backend

# نصب dependencies
pip install -r requirements.txt

# اجرای سرور
python run.py

# یا با uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend روی `http://localhost:8000` اجرا می‌شود.

API Documentation: `http://localhost:8000/docs`

### 2️⃣ راه‌اندازی Frontend

```bash
# در روت پروژه
pnpm install

# ایجاد فایل .env
cp .env.example .env

# محتوای .env:
VITE_API_URL=http://localhost:8000/api

# اجرای dev server
pnpm dev
```

Frontend روی `http://localhost:5173` اجرا می‌شود.

## 🐳 استفاده از Docker

### اجرای سریع با Docker Compose

```bash
# ساخت و اجرا
docker-compose up --build

# اجرا در background
docker-compose up -d

# مشاهده logs
docker-compose logs -f

# توقف
docker-compose down
```

### اجرای جداگانه

**Backend:**
```bash
cd backend
docker build -t clinical-backend .
docker run -p 8000:8000 clinical-backend
```

## 🌐 Deploy به Production

### Vercel (Frontend)

1. Push کد به GitHub
2. Import project در Vercel
3. تنظیم Environment Variables:
   ```
   VITE_API_URL=https://your-backend.com/api
   ```
4. Deploy!

### Railway / Render (Backend)

**Railway:**
```bash
# نصب Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up
```

**Render:**
1. Connect GitHub repository
2. New Web Service
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### با AWS EC2

```bash
# SSH به سرور
ssh ubuntu@your-server-ip

# نصب dependencies
sudo apt update
sudo apt install python3-pip nginx

# Clone repository
git clone https://github.com/your-repo.git
cd your-repo/backend

# نصب و راه‌اندازی
pip3 install -r requirements.txt
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### تنظیم Nginx

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🗄️ Database Setup

### SQLite (Development)
به صورت خودکار ساخته می‌شود. نیازی به تنظیمات ندارد.

### PostgreSQL (Production)

```bash
# نصب PostgreSQL
sudo apt install postgresql postgresql-contrib

# ایجاد database
sudo -u postgres psql
CREATE DATABASE clinical_mastery;
CREATE USER clinical_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE clinical_mastery TO clinical_user;
\q

# تنظیم در .env
DATABASE_URL=postgresql://clinical_user:your_password@localhost/clinical_mastery
```

## 📊 Monitoring & Logs

### Backend Logs
```bash
# Development
tail -f logs/app.log

# Production (systemd)
journalctl -u clinical-backend -f
```

### Health Check
```bash
curl http://localhost:8000/health
```

## 🔒 امنیت

### SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Environment Variables (Production)
```bash
# در سرور production
export SECRET_KEY="your-very-secure-secret-key-here"
export DATABASE_URL="postgresql://..."
export ALLOWED_ORIGINS="https://yourdomain.com"
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### API Tests
```bash
chmod +x test_api.sh
./test_api.sh
```

### Load Testing
```bash
# با Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/cases/random

# با wrk
wrk -t12 -c400 -d30s http://localhost:8000/api/cases/random
```

## 📈 Performance

### Backend Optimization
```bash
# استفاده از Gunicorn با چند worker
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Database Indexing
```sql
CREATE INDEX idx_results_session ON results(session_id);
CREATE INDEX idx_results_case ON results(case_id);
CREATE INDEX idx_results_created ON results(created_at);
```

## 🔄 Backup & Restore

### SQLite Backup
```bash
sqlite3 clinical_mastery.db ".backup backup_$(date +%Y%m%d).db"
```

### PostgreSQL Backup
```bash
pg_dump -U clinical_user clinical_mastery > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# SQLite
cp backup_20240101.db clinical_mastery.db

# PostgreSQL
psql -U clinical_user clinical_mastery < backup_20240101.sql
```

## 🐛 Troubleshooting

### Backend نمی‌خواهد اجرا شود
```bash
# چک کردن port
lsof -i :8000

# چک کردن logs
tail -f /var/log/clinical-backend.log

# بررسی database connection
python -c "from app.database import engine; print(engine.url)"
```

### Frontend به Backend وصل نمی‌شود
- چک کنید `.env` file دارید
- مطمئن شوید `VITE_API_URL` درست است
- CORS را در backend چک کنید

## 📞 پشتیبانی

مشکلی دارید؟
- مستندات API: `/docs`
- GitHub Issues
- Email: support@example.com
