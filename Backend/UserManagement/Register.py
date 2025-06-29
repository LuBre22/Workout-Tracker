from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from Backend.Utility.CsvManager import read_csv, dump_csv
import os
import json
import bcrypt
import re

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: EmailStr

@router.post("/register")
async def register_user(request: RegisterRequest):
    csv_path = "Backend/UserManagement/Users.csv"
    fieldnames = ["Username", "Password", "E-Mail", "Roles"]

    # RegEx check for username and password
    username_pattern = re.compile(r"^[A-Za-z0-9]+$")
    # Allow letters, numbers, and common special characters for passwords
    password_pattern = re.compile(r"^[A-Za-z0-9!@#$%^&*()_\-+=\[\]{}|;:,.<>?/`~]+$")

    if not username_pattern.fullmatch(request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username may only contain letters and numbers (A-Z, a-z, 0-9)."
        )
    if not password_pattern.fullmatch(request.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password may contain letters, numbers, and common special characters."
        )

    # Read existing users
    if os.path.exists(csv_path):
        users = read_csv(csv_path)
    else:
        users = []

    # Check if username or email already exists
    for user in users:
        if user["Username"] == request.username or user["E-Mail"] == request.email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists.")

    # Hash the password with bcrypt
    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Add new user with default "user" role
    users.append({
        "Username": request.username,
        "Password": hashed_password,
        "E-Mail": request.email,
        "Roles": json.dumps(["user"])
    })

    dump_csv(csv_path, users, fieldnames)
    return {"message": "User registered successfully"}