from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random

from app.database import get_db
from app.models import Case
from app.schemas import CaseResponse, CaseCreate
from app.data.seed_cases import CASES_DATA

router = APIRouter()


class CaseUpdate(CaseCreate):
    pass


@router.get("/", response_model=List[CaseResponse])
def get_all_cases(db: Session = Depends(get_db)):
    """Get all available clinical cases"""
    cases = db.query(Case).all()

    # If no cases in database, seed them
    if not cases:
        seed_cases(db)
        cases = db.query(Case).all()

    return cases


@router.get("/random", response_model=CaseResponse)
def get_random_case(db: Session = Depends(get_db)):
    """Get a random clinical case for practice"""
    cases = db.query(Case).all()

    if not cases:
        seed_cases(db)
        cases = db.query(Case).all()

    if not cases:
        raise HTTPException(status_code=404, detail="No cases available")

    return random.choice(cases)


@router.get("/{case_id}", response_model=CaseResponse)
def get_case_by_id(case_id: str, db: Session = Depends(get_db)):
    """Get a specific case by its ID"""
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return case


@router.post("/", response_model=CaseResponse)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    """Create a new clinical case"""
    # Check if case already exists
    existing = db.query(Case).filter(Case.case_id == case.case_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Case already exists")

    db_case = Case(
        case_id=case.case_id,
        name=case.name,
        diagnosis=case.diagnosis,
        condition=case.condition,
        position=case.position,
        diet=case.diet,
        initial_vitals=case.initial_vitals.model_dump(),
        stages=[stage.model_dump() for stage in case.stages],
        difficulty=case.difficulty,
        category=case.category
    )

    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    return db_case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, case: CaseCreate, db: Session = Depends(get_db)):
    """Update an existing clinical case"""
    db_case = db.query(Case).filter(Case.case_id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")

    # If case_id is changing, ensure the new one doesn't conflict
    if case.case_id != case_id:
        conflict = db.query(Case).filter(Case.case_id == case.case_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Case ID already in use")

    db_case.case_id = case.case_id
    db_case.name = case.name
    db_case.diagnosis = case.diagnosis
    db_case.condition = case.condition
    db_case.position = case.position
    db_case.diet = case.diet
    db_case.initial_vitals = case.initial_vitals.model_dump()
    db_case.stages = [stage.model_dump() for stage in case.stages]
    db_case.difficulty = case.difficulty
    db_case.category = case.category

    db.commit()
    db.refresh(db_case)
    return db_case


@router.delete("/{case_id}")
def delete_case(case_id: str, db: Session = Depends(get_db)):
    """Delete a clinical case"""
    db_case = db.query(Case).filter(Case.case_id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")

    db.delete(db_case)
    db.commit()
    return {"message": "Case deleted successfully", "case_id": case_id}


def seed_cases(db: Session):
    """Seed database with initial cases"""
    for case_data in CASES_DATA:
        existing = db.query(Case).filter(Case.case_id == case_data["case_id"]).first()
        if not existing:
            db_case = Case(**case_data)
            db.add(db_case)

    db.commit()
