from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.api import cases, results, stats

app = FastAPI(title="Clinical Mastery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def ensure_case_columns():
    with engine.begin() as conn:
        cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(cases)")).fetchall()
        }
        if "icd10_code" not in cols:
            conn.execute(
                text("ALTER TABLE cases ADD COLUMN icd10_code VARCHAR NOT NULL DEFAULT 'R69'")
            )
        if "case_type" not in cols:
            conn.execute(
                text("ALTER TABLE cases ADD COLUMN case_type VARCHAR NOT NULL DEFAULT 'clinic'")
            )
        if "created_at" not in cols:
            conn.execute(
                text(
                    "ALTER TABLE cases ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"
                )
            )


ensure_case_columns()

app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
