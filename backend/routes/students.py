from fastapi import APIRouter, Body, UploadFile, File, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from typing import List
import pandas as pd
from datetime import datetime

from database import student_collection, student_helper
from models import StudentSchema, ResponseModel, ErrorResponseModel
from services.face_service import generate_encodings
from services.audit_service import log_action, AuditActions
from auth import require_roles, Roles, get_current_user

# No router-level auth — individual write routes protect themselves
router = APIRouter()


@router.get("/", response_description="Students retrieved")
async def get_students():
    try:
        students = []
        async for student in student_collection.find():
            students.append(student_helper(student))
        return ResponseModel(students, "Students data retrieved successfully")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Database error. Check MongoDB connection.")


@router.get("/{usn}", response_description="Student data retrieved")
async def get_student_data(usn: str):
    student = await student_collection.find_one({"usn": usn})
    if student:
        return ResponseModel(student_helper(student), "Student data retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "Student doesn't exist.")


@router.post("/", response_description="Student data added into the database",
             dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def add_student_data(student: StudentSchema = Body(...), current_user: dict = Depends(get_current_user)):
    student = jsonable_encoder(student)
    existing = await student_collection.find_one({"usn": student["usn"]})
    if existing:
        return ErrorResponseModel("Error", 400, "Student with this USN already exists.")

    student["enrollmentStatus"] = "PENDING"
    student["faceEncodings"] = []
    student["createdAt"] = datetime.utcnow()

    new_student = await student_collection.insert_one(student)
    created_student = await student_collection.find_one({"_id": new_student.inserted_id})

    await log_action(
        action=AuditActions.STUDENT_ADD,
        performed_by=current_user["sub"],
        role=current_user["role"],
        target_type="student",
        target_id=student["usn"],
        details={"name": student["name"]}
    )

    return ResponseModel(student_helper(created_student), "Student added successfully.")


@router.post("/bulk", response_description="Bulk upload students",
             dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def bulk_add_students(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or Excel.")

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)

        students_data = df.to_dict('records')
        inserted_count = 0

        for record in students_data:
            if "usn" not in record or "name" not in record:
                continue
            existing = await student_collection.find_one({"usn": record["usn"]})
            if not existing:
                record["enrollmentStatus"] = "PENDING"
                record["faceEncodings"] = []
                record["createdAt"] = datetime.utcnow()
                await student_collection.insert_one(record)
                inserted_count += 1

        await log_action(
            action=AuditActions.ATTENDANCE_BULK,
            performed_by=current_user["sub"],
            role=current_user["role"],
            target_type="student_batch",
            target_id=file.filename,
            details={"count": inserted_count}
        )

        return ResponseModel({"inserted": inserted_count}, "Bulk upload processed.")
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Error processing file.")


@router.delete("/{usn}", response_description="Student data deleted from the database",
               dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def delete_student_data(usn: str, current_user: dict = Depends(get_current_user)):
    delete_student = await student_collection.delete_one({"usn": usn})
    if delete_student.deleted_count > 0:
        await log_action(
            action=AuditActions.STUDENT_DELETE,
            performed_by=current_user["sub"],
            role=current_user["role"],
            target_type="student",
            target_id=usn
        )
        return ResponseModel("Student with USN: {} removed".format(usn), "Student deleted successfully")
    return ErrorResponseModel("An error occurred", 404, "Student with USN {} doesn't exist".format(usn))


@router.post("/{usn}/enroll", response_description="Enroll face for student",
             dependencies=[Depends(require_roles([Roles.TEACHER, Roles.PRINCIPAL]))])
async def enroll_student_face(usn: str, files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")

    all_encodings = student.get("faceEncodings", [])

    for file in files:
        contents = await file.read()
        try:
            encodings = generate_encodings(contents)
            if encodings:
                all_encodings.append(encodings[0])
        except Exception as e:
            print(f"Error processing image {file.filename}: {e}")

    if not all_encodings:
        return ErrorResponseModel("Error", 400, "Could not find faces in the provided images.")

    await student_collection.update_one(
        {"usn": usn},
        {"$set": {"faceEncodings": all_encodings, "enrollmentStatus": "ENROLLED"}}
    )

    await log_action(
        action=AuditActions.STUDENT_ENROLL,
        performed_by=current_user["sub"],
        role=current_user["role"],
        target_type="student",
        target_id=usn,
        details={"images_count": len(files)}
    )

    return ResponseModel({"usn": usn, "encodings_count": len(all_encodings)}, "Face enrolled successfully.")
