import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient

# Database Configuration
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.alias_db
student_collection = database.get_collection("students_collection")
attendance_collection = database.get_collection("attendance_collection")

FIRST_NAMES = ["Aarav", "Aaryan", "Advait", "Akash", "Amit", "Ananya", "Aniket", "Anika", "Arjun", "Aryan", "Ayush", "Bhavya", "Chaitanya", "Dev", "Diya", "Gaurav", "Ishaan", "Ishani", "Karan", "Kavya", "Manish", "Mayank", "Myra", "Navya", "Nikhil", "Parth", "Pranav", "Priyanka", "Rahul", "Riya", "Rohan", "Saanvi", "Siddharth", "Sneha", "Tanvi", "Uday", "Varun", "Vihaan", "Yash", "Zoya"]
LAST_NAMES = ["Sharma", "Verma", "Singh", "Patel", "Gupta", "Reddy", "Iyer", "Nair", "Kulkarni", "Deshmukh", "Joshi", "Rao", "Bhat", "Agarwal", "Bansal", "Mehta", "Malhotra", "Kapoor", "Khanna", "Chopra"]
SECTIONS = ["A", "B", "C", "D"]
BRANCHES = ["Computer Science", "Information Science", "Electronics", "Mechanical"]

async def seed_data():
    print("Clearing existing students...")
    await student_collection.delete_many({})
    await attendance_collection.delete_many({})
    
    students = []
    for i in range(1, 501):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        usn = f"1CD24{random.choice(['CS', 'IS', 'EC', 'ME'])}{str(i).zfill(3)}"
        
        student = {
            "name": name,
            "usn": usn,
            "email": f"{first.lower()}.{last.lower()}{i}@cambridge.edu.in",
            "college": "Cambridge Institute of Technology",
            "branch": random.choice(BRANCHES),
            "semester": random.randint(1, 8),
            "section": random.choice(SECTIONS),
            "attendance_percentage": random.randint(65, 98)
        }
        students.append(student)
        
    if students:
        await student_collection.insert_many(students)
        print(f"Successfully seeded 500 students for {students[0]['college']}")

if __name__ == "__main__":
    asyncio.run(seed_data())
