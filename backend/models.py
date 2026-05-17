from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class StudentSchema(BaseModel):
    usn: str = Field(..., description="University Seat Number")
    name: str = Field(...)
    branch: str = Field(...)
    semester: int = Field(...)
    section: str = Field(...)
    parentContact: Optional[str] = Field(None)
    parentEmail: Optional[EmailStr] = Field(None)
    parentPin: str = Field("1234", description="4-digit PIN for parent login")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "usn": "1XX19CS001",
                "name": "John Doe",
                "branch": "CSE",
                "semester": 5,
                "section": "A",
                "parentContact": "+1234567890",
                "parentEmail": "parent@example.com"
            }
        }
    }

class UpdateStudentModel(BaseModel):
    name: Optional[str]
    branch: Optional[str]
    semester: Optional[int]
    section: Optional[str]
    parentContact: Optional[str]
    parentEmail: Optional[EmailStr]

def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }

def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}

class DisputeSchema(BaseModel):
    usn: str
    date: str
    subject: str
    reason: str
    status: str = Field("PENDING", description="PENDING, APPROVED, REJECTED")
    createdAt: datetime = Field(default_factory=datetime.now)

class NotificationSchema(BaseModel):
    usn: str
    type: str = Field(..., description="WHATSAPP, SMS, EMAIL, IN_APP")
    message: str
    sentAt: datetime = Field(default_factory=datetime.now)

class GamificationSchema(BaseModel):
    usn: str
    points: int = 0
    badges: List[str] = []
    streakCount: int = 0
    lastPresentDate: Optional[str] = None

class AssignmentSchema(BaseModel):
    title: str = Field(..., description="Assignment Title")
    course: str = Field(..., description="Course code (e.g., CS501)")
    due: str = Field(..., description="Due date (YYYY-MM-DD)")
    submitted: int = Field(0, description="Number of students submitted")
    total: int = Field(50, description="Total number of students")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "MapReduce Implementation",
                "course": "CS501",
                "due": "2026-05-18",
                "submitted": 38,
                "total": 50
            }
        }
    }

class ExamSchema(BaseModel):
    subject: str = Field(..., description="Exam Subject Name")
    date: str = Field(..., description="Date of Exam (YYYY-MM-DD)")
    time: str = Field(..., description="Time of Exam (e.g. 10:00 AM)")
    room: str = Field(..., description="Room allocated (e.g. LH-301)")
    invigilator: str = Field(..., description="Name of the invigilator")

    model_config = {
        "json_schema_extra": {
            "example": {
                "subject": "Distributed Systems",
                "date": "2026-05-20",
                "time": "10:00 AM",
                "room": "LH-301",
                "invigilator": "Dr. Wilson"
            }
        }
    }
