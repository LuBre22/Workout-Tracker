import json
import secrets
from fastapi import APIRouter, HTTPException, Request, status, Response
from pydantic import BaseModel
from Backend.Utility.CsvManager import read_csv
from fastapi.responses import JSONResponse
import os
import bcrypt

session_store = {}  # In-memory session store

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login_user(request: LoginRequest, response: Response):
    csv_path = "Backend/UserManagement/Users.csv"
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found.")

    users = read_csv(csv_path)
    for user in users:
        if user["Username"] == request.username and bcrypt.checkpw(request.password.encode('utf-8'), user["Password"].encode('utf-8')):
            roles_list = json.loads(user["Roles"])
            session_token = secrets.token_urlsafe(32)
            session_store[session_token] = {
                "username": request.username,
                "roles": roles_list
            }
            
            response = JSONResponse({"message": "Login successful"})
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="strict",
                max_age=3600
            )
            return response
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password.")

@router.post("/logout")
async def logout(response: Response, request: Request):
    session_token = request.cookies.get("session_token")
    if session_token and session_token in session_store:
        del session_store[session_token]
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie("session_token")
    return response

@router.get("/me")
async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in session_store:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_info = session_store[session_token]
    return {"username": user_info["username"], "roles": user_info["roles"]}

