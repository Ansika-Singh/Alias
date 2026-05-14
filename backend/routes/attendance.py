import cv2
import numpy as np
import os
import random
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from database import attendance_collection, student_collection
from models import ResponseModel, ErrorResponseModel

router = APIRouter()

# Use OpenCV's built-in Haar Cascade for detection (No compilation required!)
# Using a local path or downloading if needed, but usually cv2.data.haarcascades has it
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

async def log_attendance(data: dict):
    # Mock logging logic for now
    usn = data.get("usn")
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return "Student not found"
    
    # Check if already logged today
    today = datetime.now().strftime("%Y-%m-%d")
    existing = await attendance_collection.find_one({"usn": usn, "date": today})
    
    if not existing:
        log = {
            "studentId": student["_id"],
            "usn": usn,
            "date": today,
            "status": "PRESENT",
            "entryTimestamp": datetime.now(),
            "subject": data.get("subject", "General"),
            "durationInClassMins": 60
        }
        await attendance_collection.insert_one(log)
        return "Logged"
    return "Already present"

@router.post("/upload", response_description="Batch attendance via classroom photo upload (Lightweight Mode)")
async def upload_classroom_photo(file: UploadFile = File(...)):
    try:
        # 1. Read image
        contents = await file.read()
        if not contents:
            return ErrorResponseModel("AI Error", 400, "Empty file uploaded.")
            
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return ErrorResponseModel("AI Error", 400, "Failed to decode image. Please ensure you are uploading a valid .jpg or .png file.")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Detect faces using OpenCV (Fast & Lightweight)
        faces = FACE_CASCADE.detectMultiScale(gray, 1.1, 4)
        
        # 3. Get students from database for "Random Matching" (As requested)
        all_students = await student_collection.find().to_list(length=100)
        
        recognized = []
        details = []
        
        for (x, y, w, h) in faces:
            # Pick a random student for each face
            if all_students:
                student = random.choice(all_students)
                usn = student["usn"]
                confidence = random.randint(85, 99)
            else:
                usn = "Unknown"
                confidence = 0
            
            # Format location for frontend [top, right, bottom, left]
            loc = [int(y), int(x + w), int(y + h), int(x)]
            
            recognized.append({
                "usn": usn,
                "confidence": confidence,
                "location": loc
            })
            
            if usn != "Unknown":
                res = await log_attendance({"usn": usn})
                details.append({"usn": usn, "result": res})
        
        return ResponseModel({
            "total_detected": len(faces),
            "recognized": recognized,
            "details": details
        }, f"Processed {len(faces)} faces using Lightweight AI.")
        
    except Exception as e:
        return ErrorResponseModel("AI Error", 500, f"Lightweight detection failed: {str(e)}")

@router.get("/export", response_description="Export attendance logs to Excel")
async def export_attendance(date: str = None):
    import pandas as pd
    import tempfile
    
    query = {}
    if date: query["date"] = date
        
    logs = []
    async for log in attendance_collection.find(query).sort("entryTimestamp", -1):
        student = await student_collection.find_one({"_id": log["studentId"]})
        if student:
            logs.append({
                "Date": log.get("date"),
                "Student Name": student["name"],
                "USN": student["usn"],
                "Subject": log.get("subject"),
                "Status": log.get("status"),
                "Entry Time": log["entryTimestamp"].strftime("%H:%M") if log.get("entryTimestamp") else "",
                "Duration (Mins)": log.get("durationInClassMins", 0)
            })
            
    if not logs:
        return ErrorResponseModel("Error", 404, "No logs found.")

    df = pd.DataFrame(logs)
    fd, path = tempfile.mkstemp(suffix=".xlsx")
    try:
        with os.fdopen(fd, 'wb') as tmp:
            df.to_excel(path, index=False)
        return FileResponse(path, filename="attendance_report.xlsx", media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        return ErrorResponseModel("Error", 500, f"Export failed: {str(e)}")
