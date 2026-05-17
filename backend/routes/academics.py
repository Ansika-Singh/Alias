from fastapi import APIRouter, Body, Depends
from database import assignment_collection, exam_collection
from models import ResponseModel, ErrorResponseModel, AssignmentSchema, ExamSchema
from auth import require_roles, Roles
from datetime import datetime

router = APIRouter()

@router.get("/assignments", response_description="Retrieve all assignments")
async def get_assignments(current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    try:
        cursor = assignment_collection.find().sort("_id", -1)
        assignments = []
        async for a in cursor:
            a["id"] = str(a["_id"])
            del a["_id"]
            assignments.append(a)
        return ResponseModel(assignments, "Assignments retrieved successfully.")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Error retrieving assignments.")

@router.post("/assignments", response_description="Create a new assignment")
async def create_assignment(assignment: AssignmentSchema = Body(...), current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
    try:
        assignment_dict = assignment.model_dump()
        assignment_dict["createdAt"] = datetime.utcnow()
        new_assignment = await assignment_collection.insert_one(assignment_dict)
        created = await assignment_collection.find_one({"_id": new_assignment.inserted_id})
        created["id"] = str(created["_id"])
        del created["_id"]
        return ResponseModel(created, "Assignment scheduled successfully.")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Error scheduling assignment.")

@router.get("/exams", response_description="Retrieve all exams")
async def get_exams(current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL, Roles.STUDENT, Roles.PARENT]))):
    try:
        cursor = exam_collection.find().sort("date", 1)
        exams = []
        async for e in cursor:
            e["id"] = str(e["_id"])
            del e["_id"]
            exams.append(e)
        return ResponseModel(exams, "Exams retrieved successfully.")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Error retrieving exams.")

@router.post("/exams", response_description="Schedule a new exam")
async def create_exam(exam: ExamSchema = Body(...), current_user: dict = Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))):
    try:
        exam_dict = exam.model_dump()
        exam_dict["createdAt"] = datetime.utcnow()
        new_exam = await exam_collection.insert_one(exam_dict)
        created = await exam_collection.find_one({"_id": new_exam.inserted_id})
        created["id"] = str(created["_id"])
        del created["_id"]
        return ResponseModel(created, "Exam scheduled successfully.")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Error scheduling exam.")
