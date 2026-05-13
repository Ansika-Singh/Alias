import asyncio
from datetime import datetime, timedelta
from database import student_collection, timetable_collection, attendance_collection, teacher_collection
import random

async def seed_data():
    print("Starting database seeding...")
    
    # 1. Clear existing data
    await student_collection.delete_many({})
    await timetable_collection.delete_many({})
    await attendance_collection.delete_many({})
    await teacher_collection.delete_many({})
    print("Cleared existing collections.")

    # 2. Add Dummy Students
    students = [
        {"usn": "1XX20CS001", "name": "Alex Johnson", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS002", "name": "Sarah Smith", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS003", "name": "Michael Chang", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "PENDING"},
        {"usn": "1XX20CS004", "name": "Priya Patel", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS005", "name": "David Wilson", "branch": "CSE", "semester": 6, "section": "B", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS006", "name": "Emma Brown", "branch": "CSE", "semester": 6, "section": "B", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS007", "name": "James Taylor", "branch": "ISE", "semester": 4, "section": "A", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS008", "name": "Linda Garcia", "branch": "ISE", "semester": 4, "section": "A", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS009", "name": "Robert Miller", "branch": "ECE", "semester": 6, "section": "C", "enrollmentStatus": "ENROLLED"},
        {"usn": "1XX20CS010", "name": "Sophia Davis", "branch": "ECE", "semester": 6, "section": "C", "enrollmentStatus": "PENDING"},
    ]
    
    for s in students:
        s["faceEncodings"] = []
        s["createdAt"] = datetime.utcnow()
        s["parentEmail"] = f"parent.{s['usn']}@example.com"
        s["parentContact"] = "+919876543210"

    inserted_students = await student_collection.insert_many(students)
    student_ids = inserted_students.inserted_ids
    print(f"Inserted {len(student_ids)} students.")

    # 3. Add Dummy Timetable
    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
    subjects = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Systems"]
    
    for day in days:
        # Create a timetable for CSE 6th Sem Section A
        slots = [
            {"subject": subjects[0], "startTime": "09:00", "endTime": "10:00", "teacherId": "T001"},
            {"subject": subjects[1], "startTime": "10:00", "endTime": "11:00", "teacherId": "T002"},
            {"subject": subjects[2], "startTime": "11:30", "endTime": "12:30", "teacherId": "T003"},
            {"subject": subjects[3], "startTime": "13:30", "endTime": "14:30", "teacherId": "T001"},
        ]
        await timetable_collection.insert_one({
            "section": "A",
            "semester": 6,
            "dayOfWeek": day,
            "slots": slots
        })
    print("Inserted timetable for CSE 6A.")

    # 4. Add Dummy Attendance Logs for Today
    today = datetime.utcnow().strftime("%Y-%m-%d")
    logs = []
    
    # Let's say today is Monday (adjusting logic to match timetable if needed)
    current_day = datetime.utcnow().strftime("%A").upper()
    
    # Attendance for first slot (09:00 - 10:00)
    for i in range(len(students)):
        if students[i]["section"] == "A":
            # Randomize status
            rand = random.random()
            if rand < 0.7:
                status = "PRESENT"
                delay = random.randint(0, 5)
            elif rand < 0.9:
                status = "LATE"
                delay = random.randint(11, 20)
            else:
                status = "ABSENT"
                delay = 0

            if status != "ABSENT":
                entry_time = datetime.utcnow().replace(hour=9, minute=delay, second=0, microsecond=0)
                logs.append({
                    "studentId": student_ids[i],
                    "date": today,
                    "subject": "Data Structures",
                    "status": status,
                    "entryTimestamp": entry_time,
                    "exitTimestamp": entry_time + timedelta(minutes=random.randint(45, 60)),
                    "durationInClassMins": random.randint(45, 60)
                })
            else:
                logs.append({
                    "studentId": student_ids[i],
                    "date": today,
                    "subject": "Data Structures",
                    "status": "ABSENT",
                    "entryTimestamp": None,
                    "exitTimestamp": None,
                    "durationInClassMins": 0
                })

    if logs:
        await attendance_collection.insert_many(logs)
    print(f"Inserted {len(logs)} attendance logs for today.")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
