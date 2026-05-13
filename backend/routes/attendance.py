from fastapi import APIRouter, Body
from datetime import datetime
import math
from database import attendance_collection, student_collection, timetable_collection
from models import ResponseModel, ErrorResponseModel

router = APIRouter()

def is_time_between(begin_time, end_time, check_time=None):
    check_time = check_time or datetime.utcnow().time()
    if begin_time < end_time:
        return check_time >= begin_time and check_time <= end_time
    else: # crosses midnight
        return check_time >= begin_time or check_time <= end_time

@router.post("/log", response_description="Log an attendance ping from the camera node")
async def log_attendance(data: dict = Body(...)):
    # Expected data: {"usn": "1XX...", "timestamp": "2026-05-12T10:05:00Z"}
    usn = data.get("usn")
    if not usn:
        return ErrorResponseModel("Error", 400, "USN is required.")
        
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")
        
    current_time = datetime.utcnow()
    current_day = current_time.strftime("%A").upper() # e.g., MONDAY
    current_time_str = current_time.strftime("%H:%M")
    
    # 1. Find the active period for this student's section
    timetable = await timetable_collection.find_one({
        "section": student["section"],
        "semester": student["semester"],
        "dayOfWeek": current_day
    })
    
    if not timetable:
        return ResponseModel({"ignored": True}, "No classes scheduled for today.")
        
    active_slot = None
    for slot in timetable.get("slots", []):
        # Simplistic time string comparison (HH:MM)
        if slot["startTime"] <= current_time_str <= slot["endTime"]:
            active_slot = slot
            break
            
    if not active_slot:
         return ResponseModel({"ignored": True}, "No active class at this time.")
         
    # 2. Check if an attendance log already exists for this student, date, and subject
    date_str = current_time.strftime("%Y-%m-%d")
    log_query = {
        "studentId": student["_id"],
        "date": date_str,
        "subject": active_slot["subject"]
    }
    
    existing_log = await attendance_collection.find_one(log_query)
    
    if existing_log:
        # Update exit timestamp and duration
        entry_time = existing_log["entryTimestamp"]
        duration_mins = int((current_time - entry_time).total_seconds() / 60)
        
        await attendance_collection.update_one(
            {"_id": existing_log["_id"]},
            {"$set": {
                "exitTimestamp": current_time,
                "durationInClassMins": duration_mins
            }}
        )
        return ResponseModel({"status": "Updated"}, "Attendance log updated.")
    else:
        # Create a new log
        # Determine PRESENT vs LATE based on start time + 10 mins grace period
        start_dt = datetime.strptime(active_slot["startTime"], "%H:%M")
        current_dt = datetime.strptime(current_time_str, "%H:%M")
        
        diff_mins = (current_dt - start_dt).total_seconds() / 60
        status = "PRESENT" if diff_mins <= 10 else "LATE"
        
        new_log = {
            "studentId": student["_id"],
            "date": date_str,
            "subject": active_slot["subject"],
            "teacherId": active_slot["teacherId"],
            "periodStartTime": active_slot["startTime"],
            "periodEndTime": active_slot["endTime"],
            "status": status,
            "entryTimestamp": current_time,
            "exitTimestamp": current_time,
            "durationInClassMins": 0
        }
        
        await attendance_collection.insert_one(new_log)
        return ResponseModel({"status": status}, f"Marked as {status}.")

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula to calculate distance between two coordinates in meters"""
    R = 6371e3 # metres
    phi1 = lat1 * math.pi/180
    phi2 = lat2 * math.pi/180
    delta_phi = (lat2-lat1) * math.pi/180
    delta_lambda = (lon2-lon1) * math.pi/180

    a = math.sin(delta_phi/2) * math.sin(delta_phi/2) + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda/2) * math.sin(delta_lambda/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c

# Mock Campus Coordinates
CAMPUS_LAT = 12.9716
CAMPUS_LNG = 77.5946
ALLOWED_RADIUS_METERS = 500

@router.post("/qr-checkin", response_description="QR Fallback Check-in with Geo-fencing")
async def qr_checkin(data: dict = Body(...)):
    # Payload: { "usn": "1XX...", "token": "...", "lat": 12.97, "lng": 77.59 }
    usn = data.get("usn")
    lat = data.get("lat")
    lng = data.get("lng")
    
    if not usn or lat is None or lng is None:
        return ErrorResponseModel("Error", 400, "Missing required payload fields.")
        
    distance = calculate_distance(lat, lng, CAMPUS_LAT, CAMPUS_LNG)
    
    if distance > ALLOWED_RADIUS_METERS:
        return ErrorResponseModel("Error", 403, f"Check-in rejected. You are {int(distance)}m away from campus. Must be within {ALLOWED_RADIUS_METERS}m.")
        
    # If geo-fence passes, mock sending a ping to the standard log endpoint
    # In reality, you'd extract the logic from `log_attendance` to a shared service function.
    return ResponseModel({"distance_meters": int(distance)}, "QR Check-in successful within Geo-fence.")

@router.get("/", response_description="Retrieve all attendance logs")
async def get_attendance_logs(usn: str = None, date: str = None):
    query = {}
    if usn:
        student = await student_collection.find_one({"usn": usn})
        if student:
            query["studentId"] = student["_id"]
    if date:
        query["date"] = date
        
    logs = []
    async for log in attendance_collection.find(query).sort("entryTimestamp", -1).limit(100):
        # Join with student info for the frontend
        student = await student_collection.find_one({"_id": log["studentId"]})
        if student:
            log["student_name"] = student["name"]
            log["usn"] = student["usn"]
        
        # Format timestamps for JSON
        log["id"] = str(log["_id"])
        log["entryTimestamp"] = log["entryTimestamp"].isoformat() if log.get("entryTimestamp") else None
        log["exitTimestamp"] = log["exitTimestamp"].isoformat() if log.get("exitTimestamp") else None
        del log["_id"]
        logs.append(log)
        
    return ResponseModel(logs, "Attendance logs retrieved successfully.")
