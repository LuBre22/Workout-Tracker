from fastapi import HTTPException, Request

def get_username_from_request(request: Request) -> str:
    from Backend.UserManagement.Login import session_store
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in session_store:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session_store[session_token]["username"]