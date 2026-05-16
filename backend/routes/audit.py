"""
Audit Routes for ALIAS
Exposes audit log viewing and filtering for administrators.
"""

from fastapi import APIRouter, Query, Depends
from models import ResponseModel, ErrorResponseModel
from services.audit_service import get_audit_logs
from auth import require_roles, Roles

router = APIRouter(dependencies=[Depends(require_roles([Roles.PRINCIPAL]))])


@router.get("/", response_description="Get audit logs")
async def get_logs(
    limit: int = Query(50, ge=1, le=200),
    action: str = Query(None, description="Filter by action type"),
    user: str = Query(None, description="Filter by performer"),
    date_from: str = Query(None, description="Start date YYYY-MM-DD"),
    date_to: str = Query(None, description="End date YYYY-MM-DD")
):
    """Retrieve audit logs with optional filtering."""
    logs = await get_audit_logs(
        limit=limit,
        action_filter=action,
        user_filter=user,
        date_from=date_from,
        date_to=date_to
    )
    
    return ResponseModel(logs, f"Retrieved {len(logs)} audit log entries.")


@router.get("/actions", response_description="Get available audit action types")
async def get_action_types():
    """Return all possible audit action types for filtering."""
    from services.audit_service import AuditActions
    
    actions = [
        attr for attr in dir(AuditActions) 
        if not attr.startswith('_')
    ]
    
    return ResponseModel(actions, "Available audit action types.")


@router.get("/verify", response_description="Verify audit log integrity")
async def verify_audit_integrity():
    """Run a SHA-256 integrity check on the entire audit trail."""
    from services.audit_service import verify_integrity
    
    result = await verify_integrity()
    if result["status"] == "success":
        return ResponseModel(result, result["message"])
    else:
        return ErrorResponseModel("Integrity Check Failed", 418, result["message"])
