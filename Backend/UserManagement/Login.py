import json
import secrets
import os
import bcrypt
import re

from fastapi import APIRouter, HTTPException, Request, status, Response
from pydantic import BaseModel

from Backend.Utility.CsvManager import read_csv
from fastapi.responses import JSONResponse

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

    # RegEx check for username and password
    pattern = re.compile(r"^[A-Za-z0-9]+$")
    if not pattern.fullmatch(request.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username may only contain letters and numbers (A-Z, a-z, 0-9).")
    if not pattern.fullmatch(request.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password may only contain letters and numbers (A-Z, a-z, 0-9).")

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
