from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime


class Vitals(BaseModel):
    hr: int
    spo2: int
    bp: str
    gcs: int


class Stage(BaseModel):
    type: str
    question: str
    options: List[Dict[str, Any]] = []
    hint: str | None = None
    orderText: str | None = None
    vitalsUpdate: Dict[str, Any] | None = None


class CaseBase(BaseModel):
    case_id: str
    name: str
    diagnosis: str
    condition: str
    position: str
    diet: str
    initial_vitals: Vitals
    stages: List[Stage]
    difficulty: str
    category: str


class CaseCreate(CaseBase):
    pass


class CaseResponse(CaseBase):
    id: int

    class Config:
        from_attributes = True


class AnswerLog(BaseModel):
    stage_index: int | None = None
    selected_answer: str | None = None
    is_correct: bool | None = None
    timestamp: int | None = None


class ResultCreate(BaseModel):
    session_id: str
    case_id: int
    total_time: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    died: bool
    answers_log: List[AnswerLog] = []
    hints_used: int = 0


class ResultResponse(ResultCreate):
    id: int
    accuracy: float
    completed: bool
    score: int
    grade: str
    created_at: datetime

    class Config:
        from_attributes = True


class StatsSummary(BaseModel):
    total_sessions: int
    total_cases: int
    average_accuracy: float
    average_time: float
    average_score: float
    best_grade_count: Dict[str, int]
    cases_by_difficulty: Dict[str, int]


class LeaderboardEntry(BaseModel):
    rank: int
    session_id: str
    score: int
    accuracy: float
    total_time: int
    case_name: str
    created_at: datetime
