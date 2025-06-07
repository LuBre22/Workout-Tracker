from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from Backend.Utility.CsvManager import read_csv
from fastapi.responses import JSONResponse
import os

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login_user(request: LoginRequest):
    csv_path = "Backend/UserManagement/Users.csv"
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found.")

    users = read_csv(csv_path)
    for user in users:
        if user["Username"] == request.username and user["Password"] == request.password:
            roles_list = [role.strip() for role in user["Roles"].split("|") if role.strip()]
            response = JSONResponse({"message": "Login successful"})
            response.set_cookie(key="username", value=request.username, httponly=False)
            response.set_cookie(key="roles", value="|".join(roles_list), httponly=False)
            return response
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password.")