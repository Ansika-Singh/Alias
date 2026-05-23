from fastapi import APIRouter, Body, HTTPException, Depends, Query, Request, status
from database import student_collection, attendance_collection, dispute_collection, gamification_collection
from models import ResponseModel, ErrorResponseModel, DisputeSchema
from services.anomaly_service import detect_attendance_anomaly
from services.gamification_service import get_student_stats
from services.forecasting_service import forecast_attendance
from services.pdf_service import generate_student_report
from services.pdf_generator import generate_fee_receipt_pdf, generate_document_vault_pdf
from fastapi.responses import StreamingResponse
from datetime import datetime
from auth import require_roles, Roles, get_current_user, decode_access_token

def check_download_auth(request: Request, token: str = Query(None)):
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")
    try:
        return decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


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

@router.get("/download-receipt/{txn_id}", response_description="Download fee payment receipt PDF")
async def download_receipt(
    txn_id: str,
    usn: str = Query(...),
    current_user: dict = Depends(check_download_auth)
):
    try:
        student = await student_collection.find_one({"usn": usn})
        if not student:
            student = {"name": "Ansika Singh", "usn": usn, "branch": "CSE", "semester": "6"}
            
        amount = 50000
        if txn_id == "TXN_7734":
            amount = 5000
            
        txn_dates = {
            "TXN_9912": "2025-08-10",
            "TXN_8821": "2026-01-15",
            "TXN_7734": "2026-02-20"
        }
        date = txn_dates.get(txn_id, datetime.now().strftime('%Y-%m-%d'))
        
        txn_data = {
            "id": txn_id,
            "amount": amount,
            "date": date
        }
        
        pdf_buffer = generate_fee_receipt_pdf(txn_data, student)
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=receipt_{txn_id.lower()}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate fee receipt PDF: {str(e)}")

@router.get("/download-document", response_description="Download student document PDF")
async def download_document(
    usn: str = Query(...),
    doc_name: str = Query(...),
    current_user: dict = Depends(check_download_auth)
):
    try:
        student = await student_collection.find_one({"usn": usn})
        if not student:
            student = {"name": "Ansika Singh", "usn": usn, "branch": "CSE", "semester": "6"}
            
        pdf_buffer = generate_document_vault_pdf(doc_name, student)
        safe_filename = f"{doc_name.lower().replace(' ', '_').replace('\'', '')}.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={safe_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate document PDF: {str(e)}")

