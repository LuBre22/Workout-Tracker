from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from Backend.Utility.CsvManager import read_csv, dump_csv
import os

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: EmailStr

@router.post("/register")
async def register_user(request: RegisterRequest):
    csv_path = "Backend/UserManagement/Users.csv"
    fieldnames = ["Username", "Password", "E-Mail"]

    # Read existing users
    if os.path.exists(csv_path):
        users = read_csv(csv_path)
    else:
        users = []

    # Check if username or email already exists
    for user in users:
        if user["Username"] == request.username or user["E-Mail"] == request.email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists.")

    # Add new user
    users.append({
        "Username": request.username,
        "Password": request.password,  # In production, hash the password!
        "E-Mail": request.email
    })

    dump_csv(csv_path, users, fieldnames)
    return {"message": "User registered successfully"}