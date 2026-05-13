from fastapi import APIRouter
from database import attendance_collection, student_collection
from models import ResponseModel, ErrorResponseModel

router = APIRouter()

@router.get("/summary/{section}/{semester}", response_description="Get attendance analytics summary")
async def get_analytics_summary(section: str, semester: int):
    # 1. Total Enrolled in section
    total_students = await student_collection.count_documents({"section": section, "semester": semester})
    
    if total_students == 0:
        return ErrorResponseModel("Error", 404, "No students found for this section.")
        
    # 2. Find students below 75% threshold
    # To do this correctly in MongoDB, we'd use an aggregation pipeline.
    # For MVP, we will run a simplified query structure.
    
    pipeline = [
        {
            "$lookup": {
                "from": "students",
                "localField": "studentId",
                "foreignField": "_id",
                "as": "student"
            }
        },
        { "$unwind": "$student" },
        { "$match": { "student.section": section, "student.semester": semester } },
        {
            "$group": {
                "_id": "$student.usn",
                "name": { "$first": "$student.name" },
                "total_classes": { "$sum": 1 },
                "attended": {
                    "$sum": {
                        "$cond": [{ "$in": ["$status", ["PRESENT", "LATE"]] }, 1, 0]
                    }
                }
            }
        },
        {
            "$project": {
                "usn": "$_id",
                "name": 1,
                "attendance_percentage": {
                    "$multiply": [ { "$divide": ["$attended", "$total_classes"] }, 100 ]
                }
            }
        }
    ]
    
    cursor = attendance_collection.aggregate(pipeline)
    stats = await cursor.to_list(length=100)
    
    at_risk_students = [s for s in stats if s.get("attendance_percentage", 100) < 75]
    
    return ResponseModel({
        "total_enrolled": total_students,
        "at_risk_count": len(at_risk_students),
        "at_risk_students": at_risk_students
    }, "Analytics aggregated successfully.")

@router.get("/dashboard", response_description="Get global dashboard stats")
async def get_dashboard_stats():
    # This would aggregate stats across all sections for today
    from datetime import datetime
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    total_students = await student_collection.count_documents({})
    present_today = await attendance_collection.count_documents({"date": today, "status": "PRESENT"})
    late_today = await attendance_collection.count_documents({"date": today, "status": "LATE"})
    absent_today = await attendance_collection.count_documents({"date": today, "status": "ABSENT"})
    
    return ResponseModel({
        "total_enrolled": total_students,
        "present_today": present_today,
        "late_today": late_today,
        "absent_today": absent_today
    }, "Dashboard stats retrieved.")
