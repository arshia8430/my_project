from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api import cases, results, stats
from app.config import get_settings
from app.database import check_database

settings = get_settings()
API_PREFIX = settings["api_prefix"]

app = FastAPI(title="Clinical Mastery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings["cors_origins"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router, prefix=f"{API_PREFIX}/cases", tags=["cases"])
app.include_router(results.router, prefix=f"{API_PREFIX}/results", tags=["results"])
app.include_router(stats.router, prefix=f"{API_PREFIX}/stats", tags=["stats"])


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "api_prefix": API_PREFIX,
        "environment": settings["environment"],
    }


@app.get("/health/db")
def database_health_check():
    try:
        check_database()
    except Exception as exc:  # pragma: no cover - diagnostic endpoint
        raise HTTPException(status_code=503, detail=f"database unavailable: {exc}") from exc
    return {"status": "ok", "database": "ok"}
