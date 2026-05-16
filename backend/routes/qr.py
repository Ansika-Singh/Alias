"""
QR Code Routes for ALIAS
Handles QR code generation, validation, and session management.
"""

from fastapi import APIRouter, Body, Depends
from models import ResponseModel, ErrorResponseModel
from services.qr_service import generate_qr_payload, validate_qr_token, create_session_id
from services.audit_service import log_action, AuditActions
from database import student_collection, attendance_collection
from datetime import datetime

from auth import require_roles, Roles, get_current_user

router = APIRouter()


@router.post("/generate", response_description="Generate a rotating QR code for a class session", dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def generate_qr(body: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """
    Generate a QR code payload for a class session.
    Called by the teacher's dashboard to display a live QR code.
    """
    section = body.get("section", "A")
    semester = body.get("semester", 6)
    subject = body.get("subject", "Data Structures")
    
    session_id = create_session_id(section, semester, subject)
    payload = generate_qr_payload(session_id, subject, section, semester)
    
    # Audit log
    await log_action(
        action=AuditActions.SETTINGS_CHANGE, # Using settings change or define a new one if needed
        performed_by=current_user["sub"],
        role=current_user["role"],
        target_type="qr_session",
        target_id=session_id,
        details={"subject": subject, "section": section, "semester": semester}
    )
    
    return ResponseModel(payload, "QR code generated. Refreshes every 30 seconds.")


@router.post("/validate", response_description="Validate a scanned QR code token", dependencies=[Depends(require_roles([Roles.STUDENT]))])
async def validate_qr(body: dict = Body(...)):
    """
    Validate a QR token scanned by a student.
    If valid, mark the student as present for the session.
    """
    token = body.get("token")
    session_id = body.get("session_id")
    usn = body.get("usn")
    subject = body.get("subject")
    
    if not all([token, session_id, usn]):
        return ErrorResponseModel("Error", 400, "Missing required fields: token, session_id, usn")
    
    # Validate the token
    result = validate_qr_token(token, session_id)
    
    if not result["valid"]:
        return ErrorResponseModel("Invalid Token", 403, result["message"])
    
    # Find the student
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")
    
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Check for duplicate attendance
    existing = await attendance_collection.find_one({
        "studentId": student["_id"],
        "date": today,
        "subject": subject or "Unknown"
    })
    
    if existing and existing.get("status") in ["PRESENT", "LATE"]:
        return ResponseModel({"already_marked": True}, "Attendance already recorded for this session.")
    
    # Mark attendance
    now = datetime.utcnow()
    log = {
        "studentId": student["_id"],
        "usn": usn,
        "date": today,
        "subject": subject or "Unknown",
        "status": "PRESENT",
        "method": "QR_SCAN",
        "entryTimestamp": now,
        "durationInClassMins": 0,
        "qrSessionId": session_id,
        "qrDelay": result.get("delay_seconds", 0)
    }
    
    await attendance_collection.insert_one(log)
    
    # Audit log
    await log_action(
        action=AuditActions.ATTENDANCE_QR,
        performed_by=usn,
        role="student",
        target_type="attendance",
        target_id=usn,
        details={"subject": subject, "session_id": session_id, "method": "QR_SCAN"}
    )
    
    return ResponseModel({
        "marked": True,
        "student_name": student["name"],
        "subject": subject,
        "time": now.strftime("%H:%M:%S")
    }, "Attendance marked successfully via QR code.")


@router.get("/session/{section}/{semester}/{subject}", response_description="Get active QR session info", dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def get_session_info(section: str, semester: int, subject: str):
    """Get the current QR session info for a specific class."""
    session_id = create_session_id(section, semester, subject)
    payload = generate_qr_payload(session_id, subject, section, semester)
    
    return ResponseModel({
        "session_id": session_id,
        "token": payload["token"],
        "expires_in": payload["expires_in"],
        "qr_data": payload["qr_data"]
    }, "Session info retrieved.")


@router.get("/scans/{session_id}", response_description="Get recent scans for a session", dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def get_session_scans(session_id: str):
    """Fetch all students who have scanned for this specific session."""
    cursor = attendance_collection.find({"qrSessionId": session_id}).sort("entryTimestamp", -1)
    scans = await cursor.to_list(length=50)
    
    formatted_scans = []
    for scan in scans:
        # Get student name
        student = await student_collection.find_one({"_id": scan["studentId"]})
        formatted_scans.append({
            "usn": scan["usn"],
            "name": student["name"] if student else "Unknown Student",
            "time": scan["entryTimestamp"].strftime("%H:%M:%S"),
            "status": scan["status"]
        })
    
    return ResponseModel(formatted_scans, f"Retrieved {len(formatted_scans)} scans for session {session_id}")
