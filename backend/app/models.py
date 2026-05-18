from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.types import JSON
from sqlalchemy.sql import func

from app.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    diagnosis = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    position = Column(String, nullable=False)
    diet = Column(String, nullable=False)
    initial_vitals = Column(JSON, nullable=False)
    stages = Column(JSON, nullable=False)
    difficulty = Column(String, nullable=False)
    category = Column(String, nullable=False)
    icd10_code = Column(String, nullable=False, default="R69")
    case_type = Column(String, nullable=False, default="clinic")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    case_id = Column(Integer, nullable=False)
    total_time = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    wrong_answers = Column(Integer, nullable=False)
    accuracy = Column(Float, default=0)
    died = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)
    score = Column(Integer, default=0)
    grade = Column(String, default="F")
    answers_log = Column(JSON, default=list)
    hints_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
