from database import attendance_collection, timetable_collection
from datetime import datetime, timedelta

async def forecast_attendance(usn: str):
    """
    Predicts future attendance needs to reach 75%.
    """
    # 1. Current Stats
    total_present = await attendance_collection.count_documents({"usn": usn, "status": "PRESENT"})
    total_sessions = await attendance_collection.count_documents({"usn": usn})
    
    current_pct = (total_present / total_sessions * 100) if total_sessions > 0 else 0
    
    # 2. Assume semester has 90 days total, ~5 classes/day = 450 total sessions
    # This is a simplification for the demo.
    ESTIMATED_TOTAL_SESSIONS = 100 
    REQUIRED_PCT = 75
    
    target_present = int(ESTIMATED_TOTAL_SESSIONS * (REQUIRED_PCT / 100))
    needed = target_present - total_present
    remaining_sessions = ESTIMATED_TOTAL_SESSIONS - total_sessions
    
    if needed <= 0:
        message = "You are on track! Keep it up."
        sessions_to_attend = 0
    elif needed > remaining_sessions:
        message = "It might be impossible to reach 75% at this rate. Contact your HOD."
        sessions_to_attend = needed
    else:
        message = f"You need to attend {needed} out of the next {remaining_sessions} sessions to reach {REQUIRED_PCT}%."
        sessions_to_attend = needed

    return {
        "usn": usn,
        "current_pct": round(current_pct, 2),
        "needed_sessions": sessions_to_attend,
        "remaining_sessions": remaining_sessions,
        "message": message,
        "prediction": "STABLE" if current_pct >= 75 else "RISK"
    }
