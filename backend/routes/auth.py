from fastapi import APIRouter, Body, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from auth import create_access_token, Roles
from database import student_collection, teacher_collection
from services.audit_service import log_action, AuditActions

router = APIRouter()

# Principal credentials (in production, store in DB with hashed passwords)
PRINCIPAL_ACCOUNTS = {
    "principal": {"password": "principal123", "name": "Dr. Kumar"},
    "hod": {"password": "hod123", "name": "Dr. Sharma"},
}

# Teacher credentials  
TEACHER_ACCOUNTS = {
    "admin": {"password": "admin123", "name": "Admin User"},
    "teacher": {"password": "teacher123", "name": "Prof. Rao"},
    "teacher1": {"password": "teacher123", "name": "Prof. Meena"},
    "teacher2": {"password": "teacher123", "name": "Prof. Gupta"},
}


@router.post("/login", summary="User login to obtain JWT token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password
    
    # 1. Check if Principal
    if username in PRINCIPAL_ACCOUNTS:
        if password == PRINCIPAL_ACCOUNTS[username]["password"]:
            role = Roles.PRINCIPAL
            display_name = PRINCIPAL_ACCOUNTS[username]["name"]
        else:
            await log_action(AuditActions.LOGIN_FAILED, username, "unknown", "auth", username,
                           {"reason": "Invalid password for principal account"})
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    
    # 2. Check if Teacher/Admin
    elif username in TEACHER_ACCOUNTS:
        if password == TEACHER_ACCOUNTS[username]["password"]:
            role = Roles.TEACHER
            display_name = TEACHER_ACCOUNTS[username]["name"]
        else:
            await log_action(AuditActions.LOGIN_FAILED, username, "unknown", "auth", username,
                           {"reason": "Invalid password for teacher account"})
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    
    else:
        # 3. Check if Student or Parent in student_collection
        try:
            student = await student_collection.find_one({"usn": username})
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")

        if student:
            # Check for student password (USN as password for now)
            if password == username:
                role = Roles.STUDENT
                display_name = student["name"]
            # Check for parent PIN
            elif password == student.get("parentPin", "1234"):
                role = Roles.PARENT
                display_name = f"Parent of {student['name']}"
            else:
                await log_action(AuditActions.LOGIN_FAILED, username, "unknown", "auth", username,
                               {"reason": "Invalid password or PIN"})
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password or PIN")
        else:
            await log_action(AuditActions.LOGIN_FAILED, username, "unknown", "auth", username,
                           {"reason": "User not found"})
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Log successful login
    await log_action(AuditActions.LOGIN, username, role, "auth", username,
                   {"display_name": display_name})

    access_token = create_access_token({"sub": username, "role": role, "name": display_name})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "name": display_name
    }


@router.get("/roles", summary="Get available roles")
async def get_roles():
    """Return the list of available roles for the system."""
    return {
        "roles": [
            {"id": Roles.PRINCIPAL, "label": "Principal / HOD", "level": 4},
            {"id": Roles.TEACHER, "label": "Teacher / Admin", "level": 3},
            {"id": Roles.PARENT, "label": "Parent / Guardian", "level": 2},
            {"id": Roles.STUDENT, "label": "Student", "level": 1},
        ]
    }
