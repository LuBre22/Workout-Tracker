import json
import secrets
from fastapi import APIRouter, HTTPException, Request, status, Response
from pydantic import BaseModel
from Backend.Utility.CsvManager import read_csv
from fastapi.responses import JSONResponse
import os
import bcrypt
from Backend.Utility.CookieGrabber import get_username_from_request, is_admin
import bcrypt
from Backend.Utility.CsvManager import update_csv

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

@router.get("/users")
async def list_users(request: Request):
    if not is_admin(request):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    csv_path = "Backend/UserManagement/Users.csv"
    if not os.path.exists(csv_path):
        return []
    users = read_csv(csv_path)
    return [
        {
            "username": user["Username"],
            "roles": json.loads(user["Roles"])
        }
        for user in users
    ]
    
@router.put("/user/{username}/password")
async def change_user_password(username: str, data: dict, request: Request):
    # Only allow admins to change passwords
    if not is_admin(request):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    new_password = data.get("password")
    if not new_password or len(new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    csv_path = "Backend/UserManagement/Users.csv"
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="User database not found.")

    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    updated = update_csv(csv_path, "Username", username, {"Password": hashed_pw})

    if not updated:
        raise HTTPException(status_code=404, detail="User not found.")

    return {"message": "Password updated."}

@router.delete("/user/{username}", status_code=204)
async def delete_user(username: str, request: Request):
    # Only allow admins to delete users
    if not is_admin(request):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    csv_path = "Backend/UserManagement/Users.csv"
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="User database not found.")

    users = read_csv(csv_path)
    filtered_users = [user for user in users if user["Username"] != username]
    if len(filtered_users) == len(users):
        raise HTTPException(status_code=404, detail="User not found.")

    from Backend.Utility.CsvManager import write_csv
    write_csv(csv_path, filtered_users)

    # Invalidate all sessions for this user
    tokens_to_delete = [token for token, info in session_store.items() if info["username"] == username]
    for token in tokens_to_delete:
        del session_store[token]

