from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.get_database(os.getenv("DB_NAME", "alias_db"))


student_collection = database.get_collection("students")
teacher_collection = database.get_collection("users")
timetable_collection = database.get_collection("timetable")
attendance_collection = database.get_collection("attendance_logs")
leave_collection = database.get_collection("leaves")

# Helper to format object id
def student_helper(student) -> dict:
    return {
        "id": str(student["_id"]),
        "usn": student["usn"],
        "name": student["name"],
        "branch": student["branch"],
        "semester": student["semester"],
        "section": student["section"],
        "parentContact": student.get("parentContact", ""),
        "parentEmail": student.get("parentEmail", ""),
        "enrollmentStatus": student.get("enrollmentStatus", "PENDING"),
        "createdAt": student.get("createdAt")
    }
