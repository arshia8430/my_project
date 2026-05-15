from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(results.router, prefix="/api/results", tags=["results"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
