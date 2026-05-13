from fastapi import APIRouter, Body, UploadFile, File, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import pandas as pd
from datetime import datetime

from database import student_collection, student_helper
from models import StudentSchema, ResponseModel, ErrorResponseModel
from services.face_service import generate_encodings

router = APIRouter()

@router.post("/", response_description="Student data added into the database")
async def add_student_data(student: StudentSchema = Body(...)):
    student = jsonable_encoder(student)
    # Check if student with USN already exists
    existing = await student_collection.find_one({"usn": student["usn"]})
    if existing:
        return ErrorResponseModel("Error", 400, "Student with this USN already exists.")
    
    student["enrollmentStatus"] = "PENDING"
    student["faceEncodings"] = []
    student["createdAt"] = datetime.utcnow()
    
    new_student = await student_collection.insert_one(student)
    created_student = await student_collection.find_one({"_id": new_student.inserted_id})
    return ResponseModel(student_helper(created_student), "Student added successfully.")

@router.post("/bulk", response_description="Bulk upload students")
async def bulk_add_students(file: UploadFile = File(...)):
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
            # Basic validation
            if "usn" not in record or "name" not in record:
                continue
                
            existing = await student_collection.find_one({"usn": record["usn"]})
            if not existing:
                record["enrollmentStatus"] = "PENDING"
                record["faceEncodings"] = []
                record["createdAt"] = datetime.utcnow()
                await student_collection.insert_one(record)
                inserted_count += 1
                
        return ResponseModel({"inserted": inserted_count}, "Bulk upload processed.")
    except Exception as e:
         return ErrorResponseModel(str(e), 500, "Error processing file.")

@router.get("/", response_description="Students retrieved")
async def get_students():
    students = []
    async for student in student_collection.find():
        students.append(student_helper(student))
    return ResponseModel(students, "Students data retrieved successfully")

@router.get("/{usn}", response_description="Student data retrieved")
async def get_student_data(usn: str):
    student = await student_collection.find_one({"usn": usn})
    if student:
        return ResponseModel(student_helper(student), "Student data retrieved successfully")
    return ErrorResponseModel("An error occurred.", 404, "Student doesn't exist.")

@router.delete("/{usn}", response_description="Student data deleted from the database")
async def delete_student_data(usn: str):
    delete_student = await student_collection.delete_one({"usn": usn})
    if delete_student.deleted_count > 0:
        return ResponseModel(
            "Student with USN: {} removed".format(usn), "Student deleted successfully"
        )
    return ErrorResponseModel(
        "An error occurred", 404, "Student with USN {} doesn't exist".format(usn)
    )

@router.post("/{usn}/enroll", response_description="Enroll face for student")
async def enroll_student_face(usn: str, files: List[UploadFile] = File(...)):
    student = await student_collection.find_one({"usn": usn})
    if not student:
        return ErrorResponseModel("Error", 404, "Student not found.")
        
    all_encodings = student.get("faceEncodings", [])
    
    for file in files:
        contents = await file.read()
        try:
            encodings = generate_encodings(contents)
            if encodings:
                # Assuming one face per training image
                all_encodings.append(encodings[0])
        except Exception as e:
            print(f"Error processing image {file.filename}: {e}")
            
    if not all_encodings:
        return ErrorResponseModel("Error", 400, "Could not find faces in the provided images.")
        
    updated_student = await student_collection.update_one(
        {"usn": usn}, 
        {"$set": {"faceEncodings": all_encodings, "enrollmentStatus": "ENROLLED"}}
    )
    
    return ResponseModel(
        {"usn": usn, "encodings_count": len(all_encodings)},
        "Face enrolled successfully."
    )
