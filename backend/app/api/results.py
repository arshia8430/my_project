from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Result, Case
from app.schemas import ResultCreate, ResultResponse

router = APIRouter()


@router.post("/", response_model=ResultResponse)
def save_result(result: ResultCreate, db: Session = Depends(get_db)):
    """Save a completed session result"""
    # Verify case exists
    case = db.query(Case).filter(Case.id == result.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Calculate metrics
    accuracy = (result.correct_answers / result.total_questions * 100) if result.total_questions > 0 else 0
    score = calculate_score(result.total_time, result.wrong_answers, result.died)
    grade = calculate_grade(accuracy, result.total_time, result.died)

    # Create result record
    db_result = Result(
        session_id=result.session_id,
        case_id=result.case_id,
        total_time=result.total_time,
        total_questions=result.total_questions,
        correct_answers=result.correct_answers,
        wrong_answers=result.wrong_answers,
        accuracy=accuracy,
        died=result.died,
        completed=True,
        score=score,
        grade=grade,
        answers_log=[log.model_dump() for log in result.answers_log],
        hints_used=result.hints_used
    )

    db.add(db_result)
    db.commit()
    db.refresh(db_result)

    return db_result


@router.get("/{session_id}", response_model=ResultResponse)
def get_result(session_id: str, db: Session = Depends(get_db)):
    """Get result by session ID"""
    result = db.query(Result).filter(Result.session_id == session_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    return result


@router.get("/", response_model=List[ResultResponse])
def get_recent_results(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent session results"""
    results = db.query(Result).order_by(Result.created_at.desc()).limit(limit).all()
    return results


def calculate_score(total_time: int, wrong_answers: int, died: bool) -> int:
    """Calculate final score based on performance"""
    if died:
        return 0

    base_score = 100
    time_penalty = total_time // 10
    wrong_penalty = wrong_answers * 10

    score = max(0, base_score - time_penalty - wrong_penalty)
    return score


def calculate_grade(accuracy: float, total_time: int, died: bool) -> str:
    """Calculate letter grade"""
    if died:
        return "F"

    if accuracy >= 80 and total_time < 300:
        return "A+"
    elif accuracy >= 80 and total_time < 600:
        return "A"
    elif accuracy >= 60 and total_time < 600:
        return "B"
    elif accuracy >= 60:
        return "C"
    else:
        return "D"
