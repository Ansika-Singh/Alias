
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def check_db():
    load_dotenv()
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(uri)
    db = client.get_database(os.getenv("DB_NAME", "alias_db"))
    
    student_count = await db.get_collection("students").count_documents({})
    print(f"Total students: {student_count}")
    
    if student_count == 0:
        print("Database is empty!")
    else:
        sample = await db.get_collection("students").find_one()
        print(f"Sample student: {sample}")

if __name__ == "__main__":
    asyncio.run(check_db())
