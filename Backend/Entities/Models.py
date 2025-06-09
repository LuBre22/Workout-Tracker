from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ExerciseEntry(BaseModel):
    name: str
    equipment: list[str]
    targetMuscles: list[str]
    description: str

class SetInSession(BaseModel):
    setNumber: int
    reps: int
    weight: float
    
class ExerciseInSession(BaseModel):
    name: str
    sets: List[SetInSession]
    
class Session(BaseModel):
    id: str
    username: Optional[str] = None
    name: str
    timeStart: str
    timeEnd: Optional[datetime] = None
    duration: Optional[int] = None  # in minutes
    exercises: list[ExerciseInSession]

class PersonalRecord(BaseModel):
    exercise: str
    weight: float
    reps: int
    date: str
    username: Optional[str] = None