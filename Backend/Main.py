from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from Backend.UserManagement.Register import router as register_router
from Backend.UserManagement.Login import router as login_router
from Backend.UserManagement.Users import router as users_router
from Backend.Entities.Exercise import router as exercises_router
from Backend.Entities.Session import router as session_router
from Backend.Entities.PersonalRecord import router as personalrecord_router
import uvicorn
import os

from Backend.Utility.CookieGrabber import is_admin

app = FastAPI()

# Include the register router
app.include_router(register_router)
app.include_router(login_router)
app.include_router(users_router)
app.include_router(exercises_router)
app.include_router(session_router)
app.include_router(personalrecord_router)

# Redirect root (/) to /login
@app.get("/")
async def root():
    return RedirectResponse(url="/login")

# Serve login.html at /login
@app.get("/login")
async def serve_login():
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Frontend/Login.html"))
    return FileResponse(file_path, media_type="text/html")

# Serve dashboard.html at /dashboard
@app.get("/dashboard")
async def serve_dashboard():
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Frontend/Dashboard.html"))
    return FileResponse(file_path, media_type="text/html")

@app.get("/manage-users")
async def serve_users(request: Request):
    if not is_admin(request):
        raise HTTPException(status_code=403, detail="Admins only")
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Frontend/Users.html"))
    return FileResponse(file_path, media_type="text/html")

# Serve static files from the Frontend directory at /static
app.mount("/static", StaticFiles(directory=os.path.abspath(os.path.join(os.path.dirname(__file__), "../Frontend"))), name="static")

# For testing: run with `uvicorn Backend.Main:app --reload`
if __name__ == "__main__":
    uvicorn.run("Backend.Main:app", host="127.0.0.1", port=8000, reload=True)