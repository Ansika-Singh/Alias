from fastapi import APIRouter, Body, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from services.notification import send_email, send_whatsapp
from auth import create_access_token

router = APIRouter()

# Dummy user store - in real app, verify against DB
DUMMY_USERS = {
    "admin": "admin123",
    "teacher": "teacher123",
}

@router.post("/login", summary="User login to obtain JWT token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password
    if DUMMY_USERS.get(username) != password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}
