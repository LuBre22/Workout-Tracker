import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status
import os
import json
from datetime import datetime

router = APIRouter()
    
class SetInSession(BaseModel):
    setNumber: int
    reps: int
    weight: float
    
class ExerciseInSession(BaseModel):
    name: str
    sets: List[SetInSession]
    
class Session(BaseModel):
    id: str
    username: str
    name: str
    timeStart: Optional[datetime] = None
    timeEnd: Optional[datetime] = None
    duration: Optional[int] = None  # in minutes
    exercises: list[ExerciseInSession]

def session_to_dict(session: BaseModel):
    data = session.dict()
    # Convert all datetime fields to ISO format if present
    for key in ["date", "timeStart", "timeEnd"]:
        if isinstance(data.get(key), datetime):
            data[key] = data[key].isoformat()
    return data

@router.post("/session", response_model=Session, status_code=status.HTTP_201_CREATED)
async def create_current_session(session: Session):
    SESSION_FILE = "Backend/Entities/Session.json"
    # Convert date to ISO string for JSON serialization
    data = session_to_dict(session)
    with open(SESSION_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return session

@router.get("/session", response_model=Session)
async def get_current_session():
    SESSION_FILE = "Backend/Entities/Session.json"
    # Check if Session.json exists
    if not os.path.exists(SESSION_FILE):
        raise HTTPException(status_code=404, detail="No current session found.")

    # Read the session data from Session.json
    with open(SESSION_FILE, "r", encoding="utf-8") as f:
        try:
            session_data = json.load(f)
        except json.JSONDecodeError:
            raise HTTPException(status_code=404, detail="Session could not be loaded.")
    return session_data


@router.put("/session", response_model=Session)
async def update_current_session(session: Session):
    SESSION_FILE = "Backend/Entities/Session.json"
    if not os.path.exists(SESSION_FILE):
        raise HTTPException(status_code=404, detail="No current session to update.")
    data = session_to_dict(session)
    with open(SESSION_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return session

@router.delete("/session", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_session():
    SESSION_FILE = "Backend/Entities/Session.json"
    # Delete the current session by removing Session.json
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)

@router.post("/session/save", response_model=Session)
async def save_current_session():
    SESSION_FILE = "Backend/Entities/Session.json"
    SESSIONS_FILE = "Backend/Entities/Sessions.json"

    if not os.path.exists(SESSION_FILE):
        raise HTTPException(status_code=404, detail="No current session to save.")

    with open(SESSION_FILE, "r", encoding="utf-8") as f:
        session_data = json.load(f)

    # Ensure date is a string (if not already)
    if isinstance(session_data.get("date"), datetime):
        session_data["date"] = session_data["date"].isoformat()

    # Load all sessions, handle empty or invalid file
    sessions = []
    if os.path.exists(SESSIONS_FILE):
        with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
            try:
                content = f.read().strip()
                if content:
                    sessions = json.loads(content)
            except json.JSONDecodeError:
                sessions = []

    sessions.append(session_data)
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)

    # Clear Session.json
    with open(SESSION_FILE, "w", encoding="utf-8") as f:
        f.write("")

    return session_data

@router.get("/sessions", response_model=List[Session])
async def get_archived_sessions(username: str):
    SESSIONS_FILE = "Backend/Entities/Sessions.json"
    # Check if Sessions.json exists
    if not os.path.exists(SESSIONS_FILE):
        return []
    # Load and return all sessions
    with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
        sessions = json.load(f)
    return [session for session in sessions if session.get("username") == username]

@router.put("/sessions/{session_id}", response_model=Session)
async def update_archived_session(session_id: str, session: Session):
    SESSIONS_FILE = "Backend/Entities/Sessions.json"
    # Check if Sessions.json exists
    if not os.path.exists(SESSIONS_FILE):
        raise HTTPException(status_code=404, detail="No archived sessions found.")

    # Load existing sessions
    with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
        sessions = json.load(f)

    # Find and update the session with the given ID
    for idx, s in enumerate(sessions):
        if s.get("id") == session_id:
            sessions[idx] = session.dict()
            with open(SESSIONS_FILE, "w", encoding="utf-8") as fw:
                json.dump(sessions, fw, ensure_ascii=False, indent=2)
            return session

    raise HTTPException(status_code=404, detail="Session not found.")

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_archived_session(session_id: str):
    SESSIONS_FILE = "Backend/Entities/Sessions.json"
    # Check if Sessions.json exists
    if not os.path.exists(SESSIONS_FILE):
        raise HTTPException(status_code=404, detail="No archived sessions found.")

    # Load existing sessions
    with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
        sessions = json.load(f)

    # Filter out the session with the given ID
    new_sessions = [s for s in sessions if s.get("id") != session_id]

    # If no session was removed, raise an error
    if len(new_sessions) == len(sessions):
        raise HTTPException(status_code=404, detail="Session not found.")

    # Write the updated sessions back to the file
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(new_sessions, f, ensure_ascii=False, indent=2)