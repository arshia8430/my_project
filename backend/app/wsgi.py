"""Plain synchronous WSGI application for cPanel Passenger.

The backend intentionally avoids ASGI adapters/runtimes here. Passenger receives
`application(environ, start_response)` directly from `wsgi_entry.py`.
"""

from __future__ import annotations

import json
import random
import traceback
from datetime import date, datetime
from typing import Any
from urllib.parse import parse_qs

from sqlalchemy import func

from app.config import get_settings
from app.database import SessionLocal, check_database, initialize_database
from app.data.seed_cases import CASES_DATA
from app.models import Case, Result

API_MOUNT = "/api"


class HTTPError(Exception):
    def __init__(self, status: int, detail: str):
        self.status = status
        self.detail = detail
        super().__init__(detail)


def _json_default(value: Any) -> str:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def _json_response(start_response, status: int, payload: Any, headers: dict[str, str] | None = None):
    body = json.dumps(payload, default=_json_default, ensure_ascii=False).encode("utf-8")
    response_headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": str(len(body)),
        **_cors_headers(),
    }
    if headers:
        response_headers.update(headers)
    start_response(_status_line(status), list(response_headers.items()))
    return [body]


def _status_line(status: int) -> str:
    reason = {
        200: "OK",
        201: "Created",
        204: "No Content",
        400: "Bad Request",
        404: "Not Found",
        405: "Method Not Allowed",
        500: "Internal Server Error",
        503: "Service Unavailable",
    }.get(status, "OK")
    return f"{status} {reason}"


def _cors_headers() -> dict[str, str]:
    origins = get_settings()["cors_origins"]
    return {
        "Access-Control-Allow-Origin": origins[0] if origins and origins != ["*"] else "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    }


def _path_from_environ(environ: dict[str, Any]) -> str:
    path = environ.get("PATH_INFO") or "/"
    if not path.startswith("/"):
        path = f"/{path}"

    # Passenger may strip the mount point from PATH_INFO when Application URL is
    # `/api`. Keep the public contract under /api while accepting either shape.
    if path == API_MOUNT:
        return "/"
    if path.startswith(f"{API_MOUNT}/"):
        return path[len(API_MOUNT):] or "/"
    return path


def _read_json(environ: dict[str, Any]) -> dict[str, Any]:
    length = int(environ.get("CONTENT_LENGTH") or 0)
    if length <= 0:
        return {}
    raw = environ["wsgi.input"].read(length)
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPError(400, "Invalid JSON body") from exc


def _case_to_dict(case: Case) -> dict[str, Any]:
    return {
        "id": case.id,
        "case_id": case.case_id,
        "name": case.name,
        "diagnosis": case.diagnosis,
        "condition": case.condition,
        "position": case.position,
        "diet": case.diet,
        "initial_vitals": case.initial_vitals,
        "stages": case.stages,
        "difficulty": case.difficulty,
        "category": case.category,
        "icd10_code": case.icd10_code,
        "case_type": case.case_type,
        "created_at": case.created_at,
    }


def _result_to_dict(result: Result) -> dict[str, Any]:
    return {
        "id": result.id,
        "session_id": result.session_id,
        "case_id": result.case_id,
        "total_time": result.total_time,
        "total_questions": result.total_questions,
        "correct_answers": result.correct_answers,
        "wrong_answers": result.wrong_answers,
        "accuracy": result.accuracy,
        "died": result.died,
        "completed": result.completed,
        "score": result.score,
        "grade": result.grade,
        "answers_log": result.answers_log,
        "hints_used": result.hints_used,
        "created_at": result.created_at,
    }


def _seed_cases(db) -> None:
    for case_data in CASES_DATA:
        existing = db.query(Case).filter(Case.case_id == case_data["case_id"]).first()
        if existing:
            continue
        db_case = Case(**case_data)
        if not db_case.icd10_code:
            db_case.icd10_code = "R69"
        if not db_case.case_type:
            db_case.case_type = "clinic"
        db.add(db_case)
    db.commit()


def _all_cases(db) -> list[Case]:
    cases = db.query(Case).all()
    if not cases:
        _seed_cases(db)
        cases = db.query(Case).all()
    return cases


def _require_fields(data: dict[str, Any], fields: list[str]) -> None:
    missing = [field for field in fields if field not in data]
    if missing:
        raise HTTPError(400, f"Missing required field(s): {', '.join(missing)}")


def _case_from_payload(data: dict[str, Any]) -> Case:
    _require_fields(
        data,
        [
            "case_id",
            "name",
            "diagnosis",
            "condition",
            "position",
            "diet",
            "initial_vitals",
            "stages",
            "difficulty",
            "category",
            "icd10_code",
            "case_type",
        ],
    )
    return Case(
        case_id=data["case_id"],
        name=data["name"],
        diagnosis=data["diagnosis"],
        condition=data["condition"],
        position=data["position"],
        diet=data["diet"],
        initial_vitals=data["initial_vitals"],
        stages=data["stages"],
        difficulty=data["difficulty"],
        category=data["category"],
        icd10_code=data["icd10_code"],
        case_type=data["case_type"],
    )


def _handle_cases(method: str, parts: list[str], environ: dict[str, Any], db):
    if method == "GET" and parts == ["cases"]:
        return [_case_to_dict(case) for case in _all_cases(db)]

    if method == "GET" and parts == ["cases", "random"]:
        cases = _all_cases(db)
        if not cases:
            raise HTTPError(404, "No cases available")
        return _case_to_dict(random.choice(cases))

    if method == "GET" and len(parts) == 2 and parts[0] == "cases":
        case = db.query(Case).filter(Case.case_id == parts[1]).first()
        if not case:
            raise HTTPError(404, "Case not found")
        return _case_to_dict(case)

    if method == "POST" and parts == ["cases"]:
        payload = _read_json(environ)
        existing = db.query(Case).filter(Case.case_id == payload.get("case_id")).first()
        if existing:
            raise HTTPError(400, "Case already exists")
        db_case = _case_from_payload(payload)
        db.add(db_case)
        db.commit()
        db.refresh(db_case)
        return _case_to_dict(db_case)

    if method == "PUT" and len(parts) == 2 and parts[0] == "cases":
        db_case = db.query(Case).filter(Case.case_id == parts[1]).first()
        if not db_case:
            raise HTTPError(404, "Case not found")
        payload = _read_json(environ)
        if payload.get("case_id") != parts[1]:
            conflict = db.query(Case).filter(Case.case_id == payload.get("case_id")).first()
            if conflict:
                raise HTTPError(400, "Case ID already in use")
        replacement = _case_from_payload(payload)
        for field in [
            "case_id",
            "name",
            "diagnosis",
            "condition",
            "position",
            "diet",
            "initial_vitals",
            "stages",
            "difficulty",
            "category",
            "icd10_code",
            "case_type",
        ]:
            setattr(db_case, field, getattr(replacement, field))
        db.commit()
        db.refresh(db_case)
        return _case_to_dict(db_case)

    if method == "DELETE" and len(parts) == 2 and parts[0] == "cases":
        db_case = db.query(Case).filter(Case.case_id == parts[1]).first()
        if not db_case:
            raise HTTPError(404, "Case not found")
        db.delete(db_case)
        db.commit()
        return {"message": "Case deleted successfully", "case_id": parts[1]}

    raise HTTPError(404, "Not found")


def _calculate_score(total_time: int, wrong_answers: int, died: bool) -> int:
    if died:
        return 0
    return max(0, 100 - (total_time // 10) - (wrong_answers * 10))


def _calculate_grade(accuracy: float, total_time: int, died: bool) -> str:
    if died:
        return "F"
    if accuracy >= 80 and total_time < 300:
        return "A+"
    if accuracy >= 80 and total_time < 600:
        return "A"
    if accuracy >= 60 and total_time < 600:
        return "B"
    if accuracy >= 60:
        return "C"
    return "D"


def _handle_results(method: str, parts: list[str], environ: dict[str, Any], db):
    if method == "POST" and parts == ["results"]:
        payload = _read_json(environ)
        _require_fields(
            payload,
            [
                "session_id",
                "case_id",
                "total_time",
                "total_questions",
                "correct_answers",
                "wrong_answers",
                "died",
            ],
        )
        case = db.query(Case).filter(Case.id == payload["case_id"]).first()
        if not case:
            raise HTTPError(404, "Case not found")
        accuracy = (
            payload["correct_answers"] / payload["total_questions"] * 100
            if payload["total_questions"] > 0
            else 0
        )
        result = Result(
            session_id=payload["session_id"],
            case_id=payload["case_id"],
            total_time=payload["total_time"],
            total_questions=payload["total_questions"],
            correct_answers=payload["correct_answers"],
            wrong_answers=payload["wrong_answers"],
            accuracy=accuracy,
            died=payload["died"],
            completed=True,
            score=_calculate_score(payload["total_time"], payload["wrong_answers"], payload["died"]),
            grade=_calculate_grade(accuracy, payload["total_time"], payload["died"]),
            answers_log=payload.get("answers_log", []),
            hints_used=payload.get("hints_used", 0),
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return _result_to_dict(result)

    if method == "GET" and parts == ["results"]:
        query = parse_qs(environ.get("QUERY_STRING") or "")
        limit = int((query.get("limit") or [10])[0])
        results = db.query(Result).order_by(Result.created_at.desc()).limit(limit).all()
        return [_result_to_dict(result) for result in results]

    if method == "GET" and len(parts) == 2 and parts[0] == "results":
        result = db.query(Result).filter(Result.session_id == parts[1]).first()
        if not result:
            raise HTTPError(404, "Result not found")
        return _result_to_dict(result)

    raise HTTPError(404, "Not found")


def _handle_stats(method: str, parts: list[str], environ: dict[str, Any], db):
    if method == "GET" and parts == ["stats", "summary"]:
        total_sessions = db.query(func.count(Result.id)).scalar() or 0
        total_cases = db.query(func.count(Case.id)).scalar() or 0
        avg_accuracy = db.query(func.avg(Result.accuracy)).scalar() or 0.0
        avg_time = db.query(func.avg(Result.total_time)).scalar() or 0.0
        avg_score = db.query(func.avg(Result.score)).scalar() or 0.0
        grades = db.query(Result.grade, func.count(Result.id)).group_by(Result.grade).all()
        difficulties = db.query(Case.difficulty, func.count(Case.id)).group_by(Case.difficulty).all()
        return {
            "total_sessions": total_sessions,
            "total_cases": total_cases,
            "average_accuracy": round(avg_accuracy, 2),
            "average_time": round(avg_time, 2),
            "average_score": round(avg_score, 2),
            "best_grade_count": {grade: count for grade, count in grades},
            "cases_by_difficulty": {diff: count for diff, count in difficulties},
        }

    if method == "GET" and parts == ["stats", "leaderboard"]:
        query = parse_qs(environ.get("QUERY_STRING") or "")
        limit = int((query.get("limit") or [10])[0])
        rows = (
            db.query(Result, Case)
            .join(Case, Result.case_id == Case.id)
            .filter(Result.completed == True)  # noqa: E712
            .order_by(Result.score.desc(), Result.total_time.asc())
            .limit(limit)
            .all()
        )
        return [
            {
                "rank": rank,
                "session_id": result.session_id,
                "score": result.score,
                "accuracy": result.accuracy,
                "total_time": result.total_time,
                "case_name": case.name,
                "created_at": result.created_at,
            }
            for rank, (result, case) in enumerate(rows, 1)
        ]

    if method == "GET" and len(parts) == 4 and parts[:2] == ["stats", "case"] and parts[3] == "stats":
        case_id = int(parts[2])
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
                "completion_rate": 0,
            }
        total_attempts = len(results)
        completed = len([result for result in results if result.completed and not result.died])
        return {
            "case_name": case.name,
            "diagnosis": case.diagnosis,
            "total_attempts": total_attempts,
            "average_accuracy": round(sum(result.accuracy for result in results) / total_attempts, 2),
            "average_time": round(sum(result.total_time for result in results) / total_attempts, 2),
            "completion_rate": round((completed / total_attempts) * 100, 2),
            "deaths": total_attempts - completed,
        }

    raise HTTPError(404, "Not found")


def _dispatch(method: str, path: str, environ: dict[str, Any]) -> Any:
    parts = [part for part in path.strip("/").split("/") if part]

    if method == "GET" and parts == ["health"]:
        return {"status": "ok", "mount": API_MOUNT, "environment": get_settings()["environment"]}

    if method == "GET" and parts == ["health", "db"]:
        check_database()
        return {"status": "ok", "database": "ok"}

    if parts and parts[0] in {"cases", "results", "stats"}:
        initialize_database()
        db = SessionLocal()
        try:
            if parts[0] == "cases":
                return _handle_cases(method, parts, environ, db)
            if parts[0] == "results":
                return _handle_results(method, parts, environ, db)
            return _handle_stats(method, parts, environ, db)
        finally:
            db.close()

    raise HTTPError(404, "Not found")


def application(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET").upper()
    if method == "OPTIONS":
        start_response("204 No Content", list(_cors_headers().items()))
        return [b""]

    path = _path_from_environ(environ)
    try:
        payload = _dispatch(method, path, environ)
        return _json_response(start_response, 200, payload)
    except HTTPError as exc:
        return _json_response(start_response, exc.status, {"detail": exc.detail})
    except Exception as exc:  # pragma: no cover - defensive WSGI boundary
        traceback.print_exc()
        return _json_response(start_response, 500, {"detail": str(exc)})
