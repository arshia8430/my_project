from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import Result, Case
from app.schemas import StatsSummary, LeaderboardEntry

router = APIRouter()


@router.get("/summary", response_model=StatsSummary)
def get_statistics_summary(db: Session = Depends(get_db)):
    """Get overall statistics summary"""
    total_sessions = db.query(func.count(Result.id)).scalar() or 0
    total_cases = db.query(func.count(Case.id)).scalar() or 0

    avg_accuracy = db.query(func.avg(Result.accuracy)).scalar() or 0.0
    avg_time = db.query(func.avg(Result.total_time)).scalar() or 0.0
    avg_score = db.query(func.avg(Result.score)).scalar() or 0.0

    # Grade distribution
    grades = db.query(Result.grade, func.count(Result.id)).group_by(Result.grade).all()
    best_grade_count = {grade: count for grade, count in grades}

    # Cases by difficulty
    difficulties = db.query(Case.difficulty, func.count(Case.id)).group_by(Case.difficulty).all()
    cases_by_difficulty = {diff: count for diff, count in difficulties}

    return StatsSummary(
        total_sessions=total_sessions,
        total_cases=total_cases,
        average_accuracy=round(avg_accuracy, 2),
        average_time=round(avg_time, 2),
        average_score=round(avg_score, 2),
        best_grade_count=best_grade_count,
        cases_by_difficulty=cases_by_difficulty
    )


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """Get top scores leaderboard"""
    results = (
        db.query(Result, Case)
        .join(Case, Result.case_id == Case.id)
        .filter(Result.completed == True)
        .order_by(Result.score.desc(), Result.total_time.asc())
        .limit(limit)
        .all()
    )

    leaderboard = []
    for rank, (result, case) in enumerate(results, 1):
        leaderboard.append(
            LeaderboardEntry(
                rank=rank,
                session_id=result.session_id,
                score=result.score,
                accuracy=result.accuracy,
                total_time=result.total_time,
                case_name=case.name,
                created_at=result.created_at
            )
        )

    return leaderboard


@router.get("/case/{case_id}/stats")
def get_case_statistics(case_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific case"""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return {"error": "Case not found"}

    results = db.query(Result).filter(Result.case_id == case_id).all()

    if not results:
        return {
            "case_name": case.name,
            "total_attempts": 0,
            "average_accuracy": 0,
            "average_time": 0,
            "completion_rate": 0
        }

    total_attempts = len(results)
    completed = len([r for r in results if r.completed and not r.died])

    avg_accuracy = sum(r.accuracy for r in results) / total_attempts
    avg_time = sum(r.total_time for r in results) / total_attempts
    completion_rate = (completed / total_attempts) * 100

    return {
        "case_name": case.name,
        "diagnosis": case.diagnosis,
        "total_attempts": total_attempts,
        "average_accuracy": round(avg_accuracy, 2),
        "average_time": round(avg_time, 2),
        "completion_rate": round(completion_rate, 2),
        "deaths": total_attempts - completed
    }
