from fastapi import APIRouter, UploadFile, File, Form
from models import ResponseModel, ErrorResponseModel
import os
import shutil

router = APIRouter()

FACES_DIR = "data/faces"
if not os.path.exists(FACES_DIR):
    os.makedirs(FACES_DIR)

@router.post("/register", response_description="Register a student's face image")
async def register_face(usn: str = Form(...), file: UploadFile = File(...)):
    try:
        # Save the file with the USN as filename
        # This will be used by the attendance recognition logic
        extension = os.path.splitext(file.filename)[1]
        if not extension:
            extension = ".jpg" # Default
            
        file_path = os.path.join(FACES_DIR, f"{usn}{extension}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Here we could also trigger an encoding pre-generation if we use a cache
        
        return ResponseModel({"usn": usn, "path": file_path}, "Face registered successfully.")
    except Exception as e:
        return ErrorResponseModel("Error", 500, f"Failed to register face: {str(e)}")
