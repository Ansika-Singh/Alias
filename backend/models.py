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
