import json
import os
import bcrypt
from fastapi import APIRouter, HTTPException, Request

from Backend.Utility.CookieGrabber import is_admin
from Backend.Utility.CsvManager import read_csv, update_csv
from .Login import session_store

router = APIRouter()

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

@router.put("/user/{username}/roles")
async def update_user_roles(username: str, data: dict, request: Request):
    # Only allow admins to update roles
    if not is_admin(request):
        raise HTTPException(status_code=403, detail="Admin privileges required")

    # Validate roles input
    roles = data.get("roles")
    if not isinstance(roles, list) or not all(isinstance(r, str) for r in roles):
        raise HTTPException(status_code=400, detail="Roles must be a list of strings.")

    # Only allow 'user' and 'admin' as valid roles
    valid_roles = {"user", "admin"}
    if not set(roles).issubset(valid_roles):
        raise HTTPException(status_code=400, detail="Invalid roles specified.")

    csv_path = "Backend/UserManagement/Users.csv"
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="User database not found.")

    # Update the roles in the CSV
    import json
    from Backend.Utility.CsvManager import update_csv

    updated = update_csv(csv_path, "Username", username, {"Roles": json.dumps(roles)})

    if not updated:
        raise HTTPException(status_code=404, detail="User not found.")

    return {"message": "Roles updated.", "roles": roles}
