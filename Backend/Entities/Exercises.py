from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
import os
import json

router = APIRouter()

class ExerciseEntry(BaseModel):
    name: str
    equipment: str
    targetMuscles: list[str]
    description: str

EXERCISES_FILE = "Backend/Entities/exercises.json"

def load_exercises() -> List[ExerciseEntry]:
    if not os.path.exists(EXERCISES_FILE):
        return []
    with open(EXERCISES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        return [ExerciseEntry(**item) for item in data]

def save_exercises(exercises: List[ExerciseEntry]):
    with open(EXERCISES_FILE, "w", encoding="utf-8") as f:
        json.dump([e.dict() for e in exercises], f, ensure_ascii=False, indent=2)

@router.get("/exercises", response_model=List[ExerciseEntry])
async def get_exercises():
    return load_exercises()

@router.get("/exercises/{name}", response_model=ExerciseEntry)
async def get_exercise(name: str):
    exercises = load_exercises()
    for exercise in exercises:
        if exercise.name.lower() == name.lower():
            return exercise
    raise HTTPException(status_code=404, detail="Exercise not found")

@router.post("/exercises", response_model=ExerciseEntry, status_code=status.HTTP_201_CREATED)
async def create_exercise(entry: ExerciseEntry):
    exercises = load_exercises()
    if any(e.name.lower() == entry.name.lower() for e in exercises):
        raise HTTPException(status_code=400, detail="Exercise with this name already exists")
    exercises.append(entry)
    save_exercises(exercises)
    return entry

@router.put("/exercises/{name}", response_model=ExerciseEntry)
async def update_exercise(name: str, entry: ExerciseEntry):
    exercises = load_exercises()
    for idx, exercise in enumerate(exercises):
        if exercise.name.lower() == name.lower():
            exercises[idx] = entry
            save_exercises(exercises)
            return entry
    raise HTTPException(status_code=404, detail="Exercise not found")

@router.delete("/exercises/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(name: str):
    exercises = load_exercises()
    new_exercises = [e for e in exercises if e.name.lower() != name.lower()]
    if len(new_exercises) == len(exercises):
        raise HTTPException(status_code=404, detail="Exercise not found")
    save_exercises(new_exercises)

