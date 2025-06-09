from fastapi import APIRouter, HTTPException, status, Request
from typing import List
import json
import os

from Backend.Entities.Models import PersonalRecord
from Utility.CookieGrabber import get_username_from_request

router = APIRouter()

PR_FILE = "Backend/Entities/PersonalRecords.json"

# Helper to load/save records
def load_records() -> List[PersonalRecord]:
    if not os.path.exists(PR_FILE):
        return []
    with open(PR_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return [PersonalRecord(**item) for item in data]
        except Exception:
            return []

def save_records(records: List[PersonalRecord]):
    with open(PR_FILE, "w", encoding="utf-8") as f:
        json.dump([r.dict() for r in records], f, ensure_ascii=False, indent=2)

# Create a new personal record
@router.post("/personal-records", response_model=PersonalRecord, status_code=status.HTTP_201_CREATED)
async def create_personal_record(record: PersonalRecord):
    records = load_records()
    records.append(record)
    save_records(records)
    return record

# Get all personal records for the logged-in user
@router.get("/personal-records", response_model=List[PersonalRecord])
async def get_personal_records(request: Request):
    from Backend.UserManagement.Login import session_store
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in session_store:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = session_store[session_token]["username"]
    records = load_records()
    return [r for r in records if r.username == username]

# Update a personal record (by exercise, for logged-in user)
@router.put("/personal-records", response_model=PersonalRecord)
async def update_personal_record(record: PersonalRecord, request: Request):
    username = get_username_from_request(request)
    records = load_records()
    for idx, r in enumerate(records):
        if (
            r.exercise == record.exercise and
            r.username == username
        ):
            # Overwrite username to ensure only the logged-in user can update their record
            record.username = username
            records[idx] = record
            save_records(records)
            return record
    raise HTTPException(status_code=404, detail="Personal record not found.")

# Delete a personal record (by exercise, for logged-in user)
@router.delete("/personal-records", status_code=status.HTTP_204_NO_CONTENT)
async def delete_personal_record(exercise: str, request: Request):
    username = get_username_from_request(request)
    records = load_records()
    new_records = [r for r in records if not (r.exercise == exercise and r.username == username)]
    if len(new_records) == len(records):
        raise HTTPException(status_code=404, detail="Personal record not found.")
    save_records(new_records)

# Update PRs from sessions (for logged-in user)
@router.post("/personal-records/update")
async def update_personal_records_from_sessions(request: Request):
    username = get_username_from_request(request)
    SESSIONS_FILE = "Backend/Entities/Sessions.json"
    EXERCISES_FILE = "Backend/Entities/exercises.json"

    # Load all exercises
    if not os.path.exists(EXERCISES_FILE):
        raise HTTPException(status_code=404, detail="No exercises found.")
    with open(EXERCISES_FILE, "r", encoding="utf-8") as f:
        exercises = json.load(f)
    exercise_names = [ex["name"] for ex in exercises]

    # Load all sessions for this user
    if not os.path.exists(SESSIONS_FILE):
        raise HTTPException(status_code=404, detail="No sessions found.")
    with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
        sessions = json.load(f)
    user_sessions = [s for s in sessions if s.get("username") == username]

    # Find best set for each exercise
    best_records = {}
    for ex_name in exercise_names:
        best_set = None
        best_session_date = None
        for session in user_sessions:
            for ex in session.get("exercises", []):
                if ex.get("name") == ex_name:
                    for set_ in ex.get("sets", []):
                        # Compare: higher weight first, then higher reps
                        if (
                            best_set is None or
                            set_["weight"] > best_set["weight"] or
                            (set_["weight"] == best_set["weight"] and set_["reps"] > best_set["reps"])
                        ):
                            best_set = set_
                            # Store only the date part for PR, keep time for session
                            dt_str = session.get("timeEnd") or session.get("timeStart")
                            if dt_str:
                                try:
                                    from datetime import datetime
                                    dt = datetime.fromisoformat(dt_str)
                                    best_session_date = dt.date().isoformat()
                                except Exception:
                                    best_session_date = dt_str.split("T")[0] if "T" in dt_str else dt_str
                            else:
                                best_session_date = None
        if best_set:
            best_records[ex_name] = {
                "exercise": ex_name,
                "weight": best_set["weight"],
                "reps": best_set["reps"],
                "date": best_session_date,  # Only the date part
                "username": username
            }

    # Save/update PR_FILE for this user
    all_records = load_records()
    # Remove old PRs for this user
    all_records = [r for r in all_records if r.username != username]
    # Add new PRs
    for rec in best_records.values():
        all_records.append(PersonalRecord(**rec))
    save_records(all_records)
    return {"updated": True, "count": len(best_records)}