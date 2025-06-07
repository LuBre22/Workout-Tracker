from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from Backend.UserManagement.Register import router as register_router
import uvicorn
import os

app = FastAPI()

# Include the register router
app.include_router(register_router)

# Redirect root (/) to /login
@app.get("/")
async def root():
    return RedirectResponse(url="/login")

# Serve login.html at /login
@app.get("/login")
async def serve_login():
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../Frontend/Login.html"))
    return FileResponse(file_path, media_type="text/html")

# For testing: run with `uvicorn Backend.Main:app --reload`
if __name__ == "__main__":
    uvicorn.run("Backend.Main:app", host="127.0.0.1", port=8000, reload=True)