from fastapi import APIRouter, Body, HTTPException, Depends
from database import student_collection, attendance_collection, dispute_collection, gamification_collection
from models import ResponseModel, ErrorResponseModel, DisputeSchema
from services.anomaly_service import detect_attendance_anomaly
from services.gamification_service import get_student_stats
from services.forecasting_service import forecast_attendance
from services.pdf_service import generate_student_report
from fastapi.responses import StreamingResponse
from datetime import datetime
from auth import require_roles, Roles, get_current_user

router = APIRouter()

@router.get("/{usn}/dashboard", response_description="Get student dashboard data")
async def get_student_dashboard(usn: str, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found")
    
    # 1. Overall Attendance
    total_logs = await attendance_collection.count_documents({"usn": usn})
    present_logs = await attendance_collection.count_documents({"usn": usn, "status": "PRESENT"})
    attendance_pct = (present_logs / total_logs * 100) if total_logs > 0 else 0
    
    # 2. Gamification Stats
    stats = await get_student_stats(usn)
    
    # 3. Anomaly Status
    anomaly = await detect_attendance_anomaly(usn)

    # 4. Forecast
    forecast = await forecast_attendance(usn)
    
    # 5. Recent Logs
    cursor = attendance_collection.find({"usn": usn}).sort("entryTimestamp", -1).limit(5)
    recent_logs = []
    async for log in cursor:
        log["id"] = str(log["_id"])
        del log["_id"]
        recent_logs.append(log)

    return ResponseModel({
        "student": {
            "name": student["name"],
            "usn": student["usn"],
            "branch": student["branch"],
            "semester": student["semester"]
        },
        "attendance": {
            "percentage": round(attendance_pct, 2),
            "total": total_logs,
            "present": present_logs
        },
        "gamification": stats,
        "anomaly": anomaly,
        "forecast": forecast,
        "recent_logs": recent_logs
    }, "Student data retrieved successfully")

@router.post("/dispute", response_description="Raise a dispute for attendance")
async def raise_dispute(dispute: DisputeSchema = Body(...), current_user: dict = Depends(require_roles([Roles.STUDENT, Roles.PARENT]))):
    dispute_dict = dispute.model_dump()
    new_dispute = await dispute_collection.insert_one(dispute_dict)
    created_dispute = await dispute_collection.find_one({"_id": new_dispute.inserted_id})
    created_dispute["id"] = str(created_dispute["_id"])
    del created_dispute["_id"]
    return ResponseModel(created_dispute, "Dispute raised successfully")

@router.get("/{usn}/disputes", response_description="Get student disputes")
async def get_student_disputes(usn: str, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    cursor = dispute_collection.find({"usn": usn})
    disputes = []
    async for d in cursor:
        d["id"] = str(d["_id"])
        del d["_id"]
        disputes.append(d)
    return ResponseModel(disputes, "Disputes retrieved successfully")

@router.get("/{usn}/report", response_description="Generate PDF report")
async def get_pdf_report(usn: str, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found")
        
    logs = await attendance_collection.find({"usn": usn}).sort("entryTimestamp", -1).to_list(length=100)
    
    pdf_buffer = await generate_student_report(student, logs)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{usn}.pdf"}
    )
