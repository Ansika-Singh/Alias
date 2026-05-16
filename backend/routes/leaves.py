from fastapi import APIRouter, Body, Depends
from datetime import datetime
from bson import ObjectId
from database import leave_collection, student_collection
from models import ResponseModel, ErrorResponseModel
from auth import require_roles, Roles, get_current_user

router = APIRouter()

@router.post("/apply", response_description="Student applies for leave")
async def apply_leave(data: dict = Body(...), current_user: dict = Depends(require_roles([Roles.STUDENT, Roles.PARENT]))):
    # Payload: {"usn": "...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "reason": "..."}
    usn = data.get("usn")
    if not usn:
        return ErrorResponseModel("Error", 400, "USN is required")
        
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found")
        
    leave_req = {
        "studentId": student["_id"],
        "usn": usn,
        "startDate": data.get("startDate"),
        "endDate": data.get("endDate"),
        "reason": data.get("reason"),
        "status": "PENDING",
        "createdAt": datetime.utcnow()
    }
    
    await leave_collection.insert_one(leave_req)
    return ResponseModel({"status": "PENDING"}, "Leave request submitted successfully.")

@router.post("/{leave_id}/approve", response_description="Teacher approves leave")
async def approve_leave(leave_id: str, data: dict = Body(...), current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
    # Payload: {"teacherId": "...", "decision": "APPROVED" | "REJECTED"}
    decision = data.get("decision", "APPROVED")
    
    try:
        updated = await leave_collection.update_one(
            {"_id": ObjectId(leave_id)},
            {"$set": {"status": decision, "approvedBy": data.get("teacherId")}}
        )
        if updated.modified_count == 0:
            return ErrorResponseModel("Error", 404, "Leave request not found or unchanged.")
            
        return ResponseModel({"status": decision}, f"Leave {decision.lower()} successfully.")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Invalid ID format.")
