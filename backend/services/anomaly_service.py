import numpy as np
from datetime import datetime, timedelta
from database import attendance_collection, student_collection

async def detect_attendance_anomaly(usn: str):
    """
    Detects if a student's attendance has dropped significantly (e.g., 10% in 2 weeks).
    Uses a simple trend analysis over the last 14 days.
    """
    today = datetime.now()
    two_weeks_ago = today - timedelta(days=14)
    one_week_ago = today - timedelta(days=7)

    # Fetch attendance logs for the last 14 days
    cursor = attendance_collection.find({
        "usn": usn,
        "entryTimestamp": {"$gte": two_weeks_ago}
    }).sort("entryTimestamp", 1)
    
    logs = await cursor.to_list(length=100)
    
    if len(logs) < 5:  # Not enough data to form a trend
        return None

    # Calculate attendance for Week 1 (14-7 days ago) and Week 2 (7-0 days ago)
    week1_count = 0
    week1_total = 0
    week2_count = 0
    week2_total = 0

    # In a real system, we'd know how many classes they SHOULD have attended.
    # For this demo, let's assume attendance is marked daily or per session.
    # We'll use a simplified version: compare presence count.
    
    # Let's get the total scheduled classes from timetable? 
    # For now, let's just use the logs we have and assume 1 log = 1 class session.
    
    for log in logs:
        log_date = log["entryTimestamp"]
        if log_date < one_week_ago:
            week1_total += 1
            if log["status"] == "PRESENT":
                week1_count += 1
        else:
            week2_total += 1
            if log["status"] == "PRESENT":
                week2_count += 1

    # Avoid division by zero
    w1_rate = (week1_count / week1_total) if week1_total > 0 else 1.0
    w2_rate = (week2_count / week2_total) if week2_total > 0 else 1.0

    drop = w1_rate - w2_rate
    
    if drop >= 0.10:  # 10% drop
        return {
            "usn": usn,
            "drop_percentage": round(drop * 100, 2),
            "week1_rate": round(w1_rate * 100, 2),
            "week2_rate": round(w2_rate * 100, 2),
            "at_risk": True,
            "message": f"Attendance dropped by {round(drop * 100, 2)}% in the last 2 weeks."
        }
    
    return None

async def get_all_at_risk_students():
    at_risk = []
    students = await student_collection.find().to_list(length=1000)
    for student in students:
        anomaly = await detect_attendance_anomaly(student["usn"])
        if anomaly:
            anomaly["name"] = student["name"]
            at_risk.append(anomaly)
    return at_risk
