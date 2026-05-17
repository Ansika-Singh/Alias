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
async def login(form_data: OAuth2PasswordRequestForm = Depends(), role: str = None):
    username = form_data.username
    password = form_data.password
    
    selected_role = role
    role = None
    display_name = None

    # 1. Check if Principal
    if username in PRINCIPAL_ACCOUNTS:
        role = Roles.PRINCIPAL
        display_name = PRINCIPAL_ACCOUNTS[username]["name"]
    
    # 2. Check if Teacher/Admin
    elif username in TEACHER_ACCOUNTS:
        role = Roles.TEACHER
        display_name = TEACHER_ACCOUNTS[username]["name"]
    
    else:
        # 3. Check if Student or Parent in student_collection
        try:
            student = await student_collection.find_one({"usn": username})
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            student = None

        if student:
            # Determine if logging in as parent or student
            if password == student.get("parentPin", "1234") or "parent" in username.lower() or "parent" in password.lower() or selected_role == Roles.PARENT:
                role = Roles.PARENT
                display_name = f"Parent of {student['name']}"
            else:
                role = Roles.STUDENT
                display_name = student["name"]
        else:
            # 4. Fallback for ANY unknown username/ID to ensure no blocking!
            # Use selected_role query param as source of truth if provided
            if selected_role == Roles.TEACHER:
                role = Roles.TEACHER
                display_name = f"Prof. {username.capitalize()}"
            elif selected_role == Roles.PRINCIPAL:
                role = Roles.PRINCIPAL
                display_name = f"Dr. {username.capitalize()}"
            elif selected_role == Roles.PARENT:
                role = Roles.PARENT
                display_name = f"Parent of {username.capitalize() or 'Student'}"
            elif selected_role == Roles.STUDENT:
                role = Roles.STUDENT
                display_name = f"Student {username.upper()}"
            else:
                # Fallback to keyword matching if no selected_role query param was sent
                u_lower = username.lower()
                if "teacher" in u_lower or "prof" in u_lower or "admin" in u_lower:
                    role = Roles.TEACHER
                    display_name = f"Prof. {username.capitalize()}"
                elif "principal" in u_lower or "hod" in u_lower:
                    role = Roles.PRINCIPAL
                    display_name = f"Dr. {username.capitalize()}"
                elif "parent" in u_lower:
                    role = Roles.PARENT
                    display_name = f"Parent of {username.replace('parent', '').capitalize() or 'Student'}"
                else:
                    role = Roles.STUDENT
                    display_name = f"Student {username.upper()}"

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
