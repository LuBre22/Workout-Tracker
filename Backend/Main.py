from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from Backend.UserManagement.Register import router as register_router
from Backend.UserManagement.Login import router as login_router
from Backend.Entities.Exercises import router as exercises_router
import uvicorn
import os

app = FastAPI()

# Include the register router
app.include_router(register_router)
app.include_router(login_router)
app.include_router(exercises_router)

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

# Serve static files from the Frontend directory at /static
app.mount("/static", StaticFiles(directory=os.path.abspath(os.path.join(os.path.dirname(__file__), "../Frontend"))), name="static")

# For testing: run with `uvicorn Backend.Main:app --reload`
if __name__ == "__main__":
    uvicorn.run("Backend.Main:app", host="127.0.0.1", port=8000, reload=True)