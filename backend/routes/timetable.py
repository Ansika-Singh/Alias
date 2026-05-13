from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from database import timetable_collection
from models import ResponseModel, ErrorResponseModel

router = APIRouter()

@router.post("/upload", response_description="Upload Timetable Excel")
async def upload_timetable(file: UploadFile = File(...)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Please upload an Excel (.xlsx) file.")
    
    try:
        # Read the excel file
        df = pd.read_excel(file.file)
        
        # Expected columns: section, semester, branch, dayOfWeek, subject, teacherId, startTime, endTime
        records = df.to_dict('records')
        
        # Group by section, semester, branch, dayOfWeek
        timetable_docs = {}
        for row in records:
            key = f"{row['section']}_{row['semester']}_{row['branch']}_{row['dayOfWeek']}"
            
            if key not in timetable_docs:
                timetable_docs[key] = {
                    "section": row['section'],
                    "semester": row['semester'],
                    "branch": row['branch'],
                    "dayOfWeek": row['dayOfWeek'].upper(),
                    "slots": []
                }
                
            timetable_docs[key]["slots"].append({
                "subject": row['subject'],
                "teacherId": str(row['teacherId']),
                "startTime": str(row['startTime']), # Expected format HH:MM
                "endTime": str(row['endTime'])
            })
            
        # Insert or update in DB
        inserted_count = 0
        for doc in timetable_docs.values():
            await timetable_collection.update_one(
                {
                    "section": doc["section"], 
                    "semester": doc["semester"], 
                    "dayOfWeek": doc["dayOfWeek"]
                },
                {"$set": doc},
                upsert=True
            )
            inserted_count += 1
            
        return ResponseModel({"days_processed": inserted_count}, "Timetable uploaded successfully.")
        
    except Exception as e:
        return ErrorResponseModel(str(e), 500, "Error processing timetable file.")
