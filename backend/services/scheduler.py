from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
from database import timetable_collection, student_collection, attendance_collection, leave_collection
from services.notification import send_email, send_whatsapp

scheduler = AsyncIOScheduler()

async def check_for_absences():
    """
    Runs periodically to check if a class period just ended. 
    If so, it marks missing students as ABSENT and sends notifications.
    """
    current_time = datetime.utcnow()
    current_day = current_time.strftime("%A").upper()
    current_time_str = current_time.strftime("%H:%M")
    
    print(f"[{current_time_str}] Running absence check job...")
    
    # Logic to find recently ended periods (e.g., ended in the last 5 minutes)
    # For simplicity in this script, we'll scan the timetable for periods that ended 
    # roughly around `current_time_str`. In production, this requires robust datetime bounds.
    
    # We will mock the trigger for now by assuming we found an ended period
    # Let's write the core query logic:
    
    # 1. Get all timetable slots
    cursor = timetable_collection.find({"dayOfWeek": current_day})
    
    async for daily_schedule in cursor:
        for slot in daily_schedule.get("slots", []):
            # If the period ended within the last ~5 minutes
            end_time = datetime.strptime(slot["endTime"], "%H:%M")
            now_dt = datetime.strptime(current_time_str, "%H:%M")
            diff = (now_dt - end_time).total_seconds() / 60
            
            if 0 <= diff <= 5: # Just ended
                print(f"Period {slot['subject']} just ended for section {daily_schedule['section']}")
                await process_absences(daily_schedule["section"], daily_schedule["semester"], slot)

async def process_absences(section, semester, slot):
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Find all students in this section
    students_cursor = student_collection.find({"section": section, "semester": semester})
    
    async for student in students_cursor:
        # Check if they have an attendance log for this subject today
        log_query = {
            "studentId": student["_id"],
            "date": date_str,
            "subject": slot["subject"]
        }
        
        log = await attendance_collection.find_one(log_query)
        
        if not log:
            # Check if student is on an APPROVED leave for today
            leave_query = {
                "studentId": student["_id"],
                "status": "APPROVED",
                "startDate": {"$lte": date_str},
                "endDate": {"$gte": date_str}
            }
            active_leave = await leave_collection.find_one(leave_query)
            
            final_status = "EXCUSED" if active_leave else "ABSENT"
            
            print(f"Marking {student['name']} as {final_status} for {slot['subject']}")
            
            # Insert record
            await attendance_collection.insert_one({
                "studentId": student["_id"],
                "date": date_str,
                "subject": slot["subject"],
                "teacherId": slot["teacherId"],
                "periodStartTime": slot["startTime"],
                "periodEndTime": slot["endTime"],
                "status": final_status,
                "entryTimestamp": None,
                "exitTimestamp": None,
                "durationInClassMins": 0
            })
            
            # Only trigger Notifications if they are truly ABSENT (not excused)
            if final_status == "ABSENT":
                if student.get("parentContact"):
                    msg = f"ALIAS ALERT: {student['name']} was absent for {slot['subject']} today ({slot['startTime']}-{slot['endTime']})."
                    send_whatsapp(student["parentContact"], msg)
                
                if student.get("parentEmail"):
                    subject = f"Absence Alert: {student['name']}"
                    body = f"Dear Parent,\n\nYour child {student['name']} was absent for the {slot['subject']} class today."
                    send_email(student["parentEmail"], subject, body)

def start_scheduler():
    if not scheduler.running:
        # Run every 5 minutes
        scheduler.add_job(check_for_absences, IntervalTrigger(minutes=5))
        scheduler.start()
        print("APScheduler started successfully.")
