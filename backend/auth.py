import os
from datetime import datetime, timedelta
from typing import Optional, List
from functools import wraps

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer

# Secret key - in production use env variable
SECRET_KEY = os.getenv("ALIAS_JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ─── Role Definitions ────────────────────────────────────────────────────────
class Roles:
    PRINCIPAL = "principal"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"

# Role hierarchy: higher roles inherit lower role permissions
ROLE_HIERARCHY = {
    Roles.PRINCIPAL: 4,
    Roles.TEACHER: 3,
    Roles.PARENT: 2,
    Roles.STUDENT: 1,
}

# Route permission mapping
ROUTE_PERMISSIONS = {
    # Admin-only routes
    "/api/audit": [Roles.PRINCIPAL],
    "/api/audit/verify": [Roles.PRINCIPAL],
    "/api/qr/generate": [Roles.PRINCIPAL, Roles.TEACHER],
    "/api/students": [Roles.PRINCIPAL, Roles.TEACHER],
    "/api/attendance": [Roles.PRINCIPAL, Roles.TEACHER],
    "/api/timetable": [Roles.PRINCIPAL, Roles.TEACHER],
    "/api/camera": [Roles.PRINCIPAL, Roles.TEACHER],
    "/api/registration": [Roles.PRINCIPAL, Roles.TEACHER],
    # Student routes
    "/api/portal": [Roles.PRINCIPAL, Roles.TEACHER, Roles.STUDENT],
    "/api/qr/validate": [Roles.STUDENT],
    # Parent routes
    "/api/leaves": [Roles.PRINCIPAL, Roles.TEACHER, Roles.PARENT, Roles.STUDENT],
}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    # In a real app, you would fetch the user from DB using payload info
    # Here we just return the payload as user representation
    return payload


def require_roles(allowed_roles: List[str]):
    """
    Dependency factory: creates a FastAPI dependency that checks 
    if the current user has one of the allowed roles.
    
    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles([Roles.PRINCIPAL]))])
        async def admin_endpoint(): ...
    """
    async def role_checker(token: str = Depends(oauth2_scheme)):
        payload = decode_access_token(token)
        user_role = payload.get("role", "")
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}. Your role: {user_role}"
            )
        
        return payload
    
    return role_checker


def check_permission(user_role: str, required_roles: List[str]) -> bool:
    """Check if a user role is in the list of required roles."""
    return user_role in required_roles
