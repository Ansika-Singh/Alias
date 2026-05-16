"""
Seed realistic attendance logs for the last 30 days for all students.
Run: python seed_attendance.py
"""
import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import random
from bson import ObjectId

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

SUBJECTS = {
    "CSE": ["Data Structures", "Operating Systems", "Computer Networks", "Machine Learning", "Software Engineering"],
    "ISE": ["Information Security", "Web Technologies", "Database Systems", "Cloud Computing", "Data Mining"],
    "ECE": ["Digital Electronics", "Signal Processing", "Embedded Systems", "VLSI Design", "Communication Systems"],
    "ME":  ["Thermodynamics", "Fluid Mechanics", "Manufacturing Processes", "Machine Design", "Heat Transfer"],
}

async def seed():
    client = AsyncIOMotorClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        tlsAllowInvalidHostnames=True,
        serverSelectionTimeoutMS=10000,
    )
    db = client["alias_db"]
    students_col = db["students"]
    attendance_col = db["attendance_logs"]

    # Clear old attendance
    deleted = await attendance_col.delete_many({})
    print(f"Cleared {deleted.deleted_count} old attendance records")

    students = await students_col.find({}).to_list(length=1000)
    print(f"Seeding attendance for {len(students)} students...")

    logs = []
    today = datetime.utcnow().date()

    for student in students:
        branch = student.get("branch", "CSE")
        subjects = SUBJECTS.get(branch, SUBJECTS["CSE"])
        # Each student has a base attendance rate between 65% and 98%
        base_rate = random.uniform(0.65, 0.98)

        for day_offset in range(30):
            date = today - timedelta(days=day_offset)
            # Skip Sundays
            if date.weekday() == 6:
                continue

            date_str = date.strftime("%Y-%m-%d")

            # 2-4 subjects per day
            daily_subjects = random.sample(subjects, k=random.randint(2, 4))

            for subject in daily_subjects:
                rand = random.random()
                if rand < base_rate * 0.9:
                    status = "PRESENT"
                elif rand < base_rate:
                    status = "LATE"
                else:
                    status = "ABSENT"

                log = {
                    "studentId": student["_id"],
                    "usn": student["usn"],
                    "date": date_str,
                    "status": status,
                    "subject": subject,
                    "section": student.get("section", "A"),
                    "semester": student.get("semester", 6),
                    "entryTimestamp": datetime.combine(date, datetime.min.time()).replace(
                        hour=random.randint(8, 16),
                        minute=random.randint(0, 59)
                    ),
                    "durationInClassMins": 60 if status != "ABSENT" else 0,
                }
                logs.append(log)

        # Batch insert every 5000 records
        if len(logs) >= 5000:
            await attendance_col.insert_many(logs)
            print(f"  Inserted batch of {len(logs)} records...")
            logs = []

    if logs:
        await attendance_col.insert_many(logs)
        print(f"  Inserted final batch of {len(logs)} records")

    total = await attendance_col.count_documents({})
    today_present = await attendance_col.count_documents({"date": today.strftime("%Y-%m-%d"), "status": "PRESENT"})
    today_absent = await attendance_col.count_documents({"date": today.strftime("%Y-%m-%d"), "status": "ABSENT"})
    today_late = await attendance_col.count_documents({"date": today.strftime("%Y-%m-%d"), "status": "LATE"})

    print(f"\n✅ Total attendance logs: {total}")
    print(f"   Today ({today}): {today_present} present, {today_absent} absent, {today_late} late")
    client.close()

asyncio.run(seed())
