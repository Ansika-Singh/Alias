from motor.motor_asyncio import AsyncIOMotorClient
import os
import ssl
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME", "alias_db")

# Strip tlsInsecure from URI — handled via kwargs
import re
MONGO_DETAILS = re.sub(r'[&?]tlsInsecure=[^&]*', '', MONGO_DETAILS)
MONGO_DETAILS = re.sub(r'\?&', '?', MONGO_DETAILS)

client = AsyncIOMotorClient(
    MONGO_DETAILS,
    tls=True,
    tlsAllowInvalidCertificates=True,
    tlsAllowInvalidHostnames=True,
    serverSelectionTimeoutMS=8000,
    connectTimeoutMS=8000,
    socketTimeoutMS=8000,
)

database = client[DB_NAME]

# Collections
student_collection        = database.get_collection("students")
teacher_collection        = database.get_collection("users")
timetable_collection      = database.get_collection("timetable")
attendance_collection     = database.get_collection("attendance_logs")
leave_collection          = database.get_collection("leaves")
notification_collection   = database.get_collection("notifications")
gamification_collection   = database.get_collection("gamification")
dispute_collection        = database.get_collection("disputes")


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
        "attendancePercent": student.get("attendancePercent", 0),
        "createdAt": student.get("createdAt")
    }
