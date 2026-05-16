"""
Seed 200 students across CSE, ISE, ECE, ME branches into MongoDB.
Run: python seed_students.py
"""
import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
import random

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

FIRST_NAMES = [
    "Aarav","Aaryan","Advait","Akash","Amit","Ananya","Aniket","Anika","Arjun","Aryan",
    "Ayush","Bhavya","Chaitanya","Dev","Diya","Gaurav","Ishaan","Ishani","Karan","Kavya",
    "Manish","Mayank","Myra","Navya","Nikhil","Parth","Pranav","Priyanka","Rahul","Riya",
    "Rohan","Saanvi","Siddharth","Sneha","Tanvi","Uday","Varun","Vihaan","Yash","Zoya",
    "Aditya","Aishwarya","Akanksha","Aman","Amrita","Ankit","Ankita","Apoorv","Archana","Arpit",
    "Ashish","Avni","Ayesha","Bharat","Chetan","Deepak","Deepika","Divya","Esha","Farhan",
    "Garima","Harsh","Harsha","Hemant","Himanshu","Isha","Jatin","Jyoti","Kabir","Kajal",
    "Kartik","Khushi","Kirti","Komal","Krishna","Kunal","Lakshmi","Lalit","Madhav","Madhuri",
    "Mahesh","Mansi","Meera","Mihir","Mohan","Mohit","Muskan","Naman","Nandini","Neha",
    "Nitin","Niyati","Om","Pallavi","Pankaj","Payal","Pooja","Prabhat","Preeti","Priya"
]

LAST_NAMES = [
    "Sharma","Verma","Singh","Patel","Gupta","Reddy","Iyer","Nair","Kulkarni","Deshmukh",
    "Joshi","Rao","Bhat","Agarwal","Bansal","Mehta","Shah","Pillai","Menon","Krishnan",
    "Mishra","Tiwari","Pandey","Dubey","Srivastava","Chauhan","Yadav","Malhotra","Kapoor","Saxena"
]

BRANCHES = ["CSE", "CSE", "CSE", "ISE", "ECE", "ME"]  # weighted towards CSE
SECTIONS = ["A", "B", "C"]
SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

def make_usn(branch, idx):
    branch_code = {"CSE": "CS", "ISE": "IS", "ECE": "EC", "ME": "ME"}[branch]
    return f"1CD22{branch_code}{str(idx).zfill(3)}"

async def seed():
    client = AsyncIOMotorClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        tlsAllowInvalidHostnames=True,
        serverSelectionTimeoutMS=10000,
    )
    db = client["alias_db"]
    col = db["students"]

    # Clear existing mock students (keep real ones)
    existing = await col.count_documents({})
    print(f"Existing students: {existing}")

    students = []
    counters = {"CSE": 300, "ISE": 300, "ECE": 300, "ME": 300}

    for i in range(800):
        branch = random.choice(BRANCHES)
        idx = counters[branch]
        counters[branch] += 1
        usn = make_usn(branch, idx)

        # Skip if already exists
        exists = await col.find_one({"usn": usn})
        if exists:
            continue

        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        semester = random.choice(SEMESTERS)
        section = random.choice(SECTIONS)
        phone = f"+91{random.randint(7000000000, 9999999999)}"

        student = {
            "usn": usn,
            "name": f"{first} {last}",
            "branch": branch,
            "semester": semester,
            "section": section,
            "parentContact": phone,
            "parentEmail": f"parent.{usn.lower()}@example.com",
            "enrollmentStatus": random.choice(["ENROLLED", "ENROLLED", "ENROLLED", "PENDING"]),
            "attendancePercent": random.randint(60, 98) if random.random() > 0.1 else random.randint(40, 74),
            "faceEncodings": [],
            "createdAt": datetime.utcnow(),
        }
        students.append(student)

    if students:
        result = await col.insert_many(students)
        print(f"✅ Inserted {len(result.inserted_ids)} students")
    else:
        print("No new students to insert (all already exist)")

    total = await col.count_documents({})
    print(f"Total students in DB: {total}")
    client.close()

asyncio.run(seed())
