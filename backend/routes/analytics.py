from fastapi import APIRouter, Depends
from database import attendance_collection, student_collection
from models import ResponseModel, ErrorResponseModel
from auth import require_roles, Roles, get_current_user

router = APIRouter()

@router.get("/summary/{section}/{semester}", response_description="Get attendance analytics summary")
async def get_analytics_summary(section: str, semester: int, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
    # 1. Total Enrolled in section
    total_students = await student_collection.count_documents({"section": section, "semester": semester})
    
    if total_students == 0:
        return ErrorResponseModel("Error", 404, "No students found for this section.")
        
    # 2. Find students below 75% threshold
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
async def get_dashboard_stats(current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
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

@router.get("/heatmap/{usn}", response_description="Get attendance heatmap data for a student")
async def get_attendance_heatmap(usn: str, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    # Find student
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")
        
    # Aggregate attendance by date
    pipeline = [
        { "$match": { "studentId": student["_id"], "status": { "$in": ["PRESENT", "LATE"] } } },
        {
            "$group": {
                "_id": "$date",
                "count": { "$sum": 1 }
            }
        },
        { "$sort": { "_id": -1 } },
        { "$limit": 180 } # Last 6 months approx
    ]
    
    cursor = attendance_collection.aggregate(pipeline)
    results = await cursor.to_list(length=180)
    
    formatted_data = [{"date": r["_id"], "count": r["count"]} for r in results]
    
    return ResponseModel(formatted_data, "Heatmap data retrieved.")

@router.get("/cohort-comparison/{section}/{semester}", response_description="Compare section against branch average")
async def get_cohort_comparison(section: str, semester: int, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
    """Compare a section's attendance against the overall branch average."""
    
    # Get all students in this section
    section_students = await student_collection.find(
        {"section": section, "semester": semester}
    ).to_list(length=100)
    
    section_usns = [s["usn"] for s in section_students]
    section_ids = [s["_id"] for s in section_students]
    
    if not section_ids:
        return ResponseModel({
            "section_avg": 0, "branch_avg": 0,
            "top_performers": 0, "low_attendance": 0
        }, "No students found.")
    
    # Calculate section average
    section_pipeline = [
        {"$match": {"studentId": {"$in": section_ids}}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$in": ["$status", ["PRESENT", "LATE"]]}, 1, 0]}}
        }}
    ]
    section_result = await attendance_collection.aggregate(section_pipeline).to_list(length=1)
    section_avg = 0
    if section_result and section_result[0]["total"] > 0:
        section_avg = round((section_result[0]["present"] / section_result[0]["total"]) * 100, 1)
    
    # Calculate branch average (all students in same semester)
    branch_students = await student_collection.find({"semester": semester}).to_list(length=500)
    branch_ids = [s["_id"] for s in branch_students]
    
    branch_pipeline = [
        {"$match": {"studentId": {"$in": branch_ids}}},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$in": ["$status", ["PRESENT", "LATE"]]}, 1, 0]}}
        }}
    ]
    branch_result = await attendance_collection.aggregate(branch_pipeline).to_list(length=1)
    branch_avg = 0
    if branch_result and branch_result[0]["total"] > 0:
        branch_avg = round((branch_result[0]["present"] / branch_result[0]["total"]) * 100, 1)
    
    # Count top performers and low attendance in section
    student_stats_pipeline = [
        {"$match": {"studentId": {"$in": section_ids}}},
        {"$group": {
            "_id": "$studentId",
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$in": ["$status", ["PRESENT", "LATE"]]}, 1, 0]}}
        }},
        {"$project": {
            "pct": {"$multiply": [{"$divide": ["$present", "$total"]}, 100]}
        }}
    ]
    student_stats = await attendance_collection.aggregate(student_stats_pipeline).to_list(length=100)
    
    top_performers = len([s for s in student_stats if s.get("pct", 0) >= 90])
    low_attendance = len([s for s in student_stats if s.get("pct", 0) < 75])
    
    return ResponseModel({
        "section_avg": section_avg,
        "branch_avg": branch_avg,
        "top_performers": top_performers,
        "low_attendance": low_attendance
    }, "Cohort comparison retrieved.")


@router.get("/subject-breakdown/{usn}", response_description="Get subject-wise attendance breakdown")
async def get_subject_breakdown(usn: str, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    """Get attendance breakdown by subject for a specific student."""
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")
    
    pipeline = [
        {"$match": {"studentId": student["_id"]}},
        {"$group": {
            "_id": "$subject",
            "total_classes": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$in": ["$status", ["PRESENT", "LATE"]]}, 1, 0]}},
            "absent": {"$sum": {"$cond": [{"$eq": ["$status", "ABSENT"]}, 1, 0]}},
            "late": {"$sum": {"$cond": [{"$eq": ["$status", "LATE"]}, 1, 0]}}
        }},
        {"$project": {
            "subject": "$_id",
            "total_classes": 1,
            "present": 1,
            "absent": 1,
            "late": 1,
            "percentage": {
                "$round": [{"$multiply": [{"$divide": ["$present", "$total_classes"]}, 100]}, 1]
            }
        }},
        {"$sort": {"percentage": 1}}  # Worst subjects first
    ]
    
    results = await attendance_collection.aggregate(pipeline).to_list(length=20)
    
    # Clean up _id field
    for r in results:
        r.pop("_id", None)
    
    return ResponseModel(results, "Subject-wise breakdown retrieved.")


@router.get("/trends/{section}/{semester}", response_description="Get weekly attendance trends")
async def get_attendance_trends(section: str, semester: int, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
    """Get weekly attendance trends for a section over the last 8 weeks."""
    from datetime import datetime, timedelta
    
    students = await student_collection.find(
        {"section": section, "semester": semester}
    ).to_list(length=100)
    student_ids = [s["_id"] for s in students]
    
    if not student_ids:
        return ResponseModel([], "No students found.")
    
    weeks = []
    today = datetime.utcnow()
    
    for week_offset in range(8):
        week_end = today - timedelta(weeks=week_offset)
        week_start = week_end - timedelta(days=7)
        
        start_str = week_start.strftime("%Y-%m-%d")
        end_str = week_end.strftime("%Y-%m-%d")
        
        pipeline = [
            {"$match": {
                "studentId": {"$in": student_ids},
                "date": {"$gte": start_str, "$lte": end_str}
            }},
            {"$group": {
                "_id": None,
                "total": {"$sum": 1},
                "present": {"$sum": {"$cond": [{"$in": ["$status", ["PRESENT", "LATE"]]}, 1, 0]}}
            }}
        ]
        
        result = await attendance_collection.aggregate(pipeline).to_list(length=1)
        
        pct = 0
        total = 0
        if result and result[0]["total"] > 0:
            pct = round((result[0]["present"] / result[0]["total"]) * 100, 1)
            total = result[0]["total"]
        
        weeks.append({
            "week": f"W{8 - week_offset}",
            "start": start_str,
            "end": end_str,
            "percentage": pct,
            "total_records": total
        })
    
    weeks.reverse()  # Chronological order
    
    return ResponseModel(weeks, "Weekly trends retrieved.")


@router.get("/monthly-report/{usn}", response_description="Get monthly attendance report data")
async def get_monthly_report(usn: str, current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    """Generate monthly report data for email/notification purposes."""
    from datetime import datetime, timedelta
    
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")
    
    # Last 30 days
    today = datetime.utcnow()
    thirty_days_ago = (today - timedelta(days=30)).strftime("%Y-%m-%d")
    today_str = today.strftime("%Y-%m-%d")
    
    pipeline = [
        {"$match": {
            "studentId": student["_id"],
            "date": {"$gte": thirty_days_ago, "$lte": today_str}
        }},
        {"$group": {
            "_id": "$subject",
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$in": ["$status", ["PRESENT", "LATE"]]}, 1, 0]}},
            "absent": {"$sum": {"$cond": [{"$eq": ["$status", "ABSENT"]}, 1, 0]}}
        }}
    ]
    
    results = await attendance_collection.aggregate(pipeline).to_list(length=20)
    
    overall_total = sum(r["total"] for r in results) if results else 0
    overall_present = sum(r["present"] for r in results) if results else 0
    overall_pct = round((overall_present / overall_total) * 100, 1) if overall_total > 0 else 0
    
    subjects = []
    for r in results:
        pct = round((r["present"] / r["total"]) * 100, 1) if r["total"] > 0 else 0
        subjects.append({
            "subject": r["_id"],
            "total": r["total"],
            "present": r["present"],
            "absent": r["absent"],
            "percentage": pct
        })
    
    return ResponseModel({
        "student_name": student["name"],
        "usn": usn,
        "period": f"{thirty_days_ago} to {today_str}",
        "overall_percentage": overall_pct,
        "total_sessions": overall_total,
        "total_present": overall_present,
        "subjects": subjects,
        "status": "GOOD" if overall_pct >= 75 else "AT_RISK"
    }, "Monthly report generated.")
