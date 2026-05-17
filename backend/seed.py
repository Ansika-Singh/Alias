import asyncio
from datetime import datetime, timedelta
from database import student_collection, timetable_collection, attendance_collection, teacher_collection, dispute_collection, gamification_collection, database, assignment_collection, exam_collection
import random

# Get the audit collection
audit_collection = database.get_collection("audit_logs")

async def seed_data():
    print("[START] Starting ALIAS Enterprise Database Seeding...")
    
    # 1. Clear existing data
    await student_collection.delete_many({})
    await timetable_collection.delete_many({})
    await attendance_collection.delete_many({})
    await teacher_collection.delete_many({})
    await dispute_collection.delete_many({})
    await gamification_collection.delete_many({})
    await audit_collection.delete_many({})
    await assignment_collection.delete_many({})
    await exam_collection.delete_many({})
    print("[DONE] Cleared all existing collections.")

    # ─── 2. Students with Parent Info ────────────────────────────────────────
    students = [
        {"usn": "1XX20CS001", "name": "Alex Johnson", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS004", "name": "Priya Patel", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "5678"},
        {"usn": "1XX19CS001", "name": "Ansika Singh", "branch": "CSE", "semester": 8, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS002", "name": "Sarah Smith", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS005", "name": "David Wilson", "branch": "CSE", "semester": 6, "section": "B", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS006", "name": "Emma Brown", "branch": "CSE", "semester": 6, "section": "B", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS007", "name": "James Taylor", "branch": "ISE", "semester": 4, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS008", "name": "Linda Garcia", "branch": "ISE", "semester": 4, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS009", "name": "Robert Miller", "branch": "ECE", "semester": 6, "section": "C", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX20CS010", "name": "Sophia Davis", "branch": "ECE", "semester": 6, "section": "C", "enrollmentStatus": "PENDING", "parentPin": "1234"},
        {"usn": "1XX21CS001", "name": "Rahul Verma", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX21CS002", "name": "Meera Krishnan", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX21CS003", "name": "Arjun Reddy", "branch": "CSE", "semester": 6, "section": "B", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX21CS004", "name": "Kavya Sharma", "branch": "CSE", "semester": 6, "section": "B", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
        {"usn": "1XX21CS005", "name": "Nikhil Jain", "branch": "CSE", "semester": 6, "section": "A", "enrollmentStatus": "ENROLLED", "parentPin": "1234"},
    ]
    
    for s in students:
        s["faceEncodings"] = []
        s["createdAt"] = datetime.utcnow()
        s["parentEmail"] = f"parent.{s['usn'].lower()}@example.com"
        s["parentContact"] = f"+9198765{random.randint(10000, 99999)}"

    inserted_students = await student_collection.insert_many(students)
    student_ids = inserted_students.inserted_ids
    print(f"✅ Inserted {len(student_ids)} students.")

    # ─── 3. Timetable for Multiple Sections ──────────────────────────────────
    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
    
    cse_subjects = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Systems"]
    ise_subjects = ["Web Technologies", "Data Mining", "Cloud Computing", "AI Fundamentals"]
    
    for day in days:
        # CSE 6A Timetable
        slots_a = [
            {"subject": cse_subjects[0], "startTime": "09:00", "endTime": "10:00", "teacherId": "teacher1"},
            {"subject": cse_subjects[1], "startTime": "10:00", "endTime": "11:00", "teacherId": "teacher2"},
            {"subject": cse_subjects[2], "startTime": "11:30", "endTime": "12:30", "teacherId": "teacher1"},
            {"subject": cse_subjects[3], "startTime": "13:30", "endTime": "14:30", "teacherId": "teacher2"},
        ]
        await timetable_collection.insert_one({
            "section": "A", "semester": 6, "dayOfWeek": day, "slots": slots_a
        })
        
        # CSE 6B Timetable
        slots_b = [
            {"subject": cse_subjects[1], "startTime": "09:00", "endTime": "10:00", "teacherId": "teacher2"},
            {"subject": cse_subjects[4], "startTime": "10:00", "endTime": "11:00", "teacherId": "teacher1"},
            {"subject": cse_subjects[0], "startTime": "11:30", "endTime": "12:30", "teacherId": "teacher1"},
            {"subject": cse_subjects[3], "startTime": "13:30", "endTime": "14:30", "teacherId": "teacher2"},
        ]
        await timetable_collection.insert_one({
            "section": "B", "semester": 6, "dayOfWeek": day, "slots": slots_b
        })
        
    print("✅ Inserted timetables for CSE 6A, 6B.")

    # ─── 4. Comprehensive Historical Attendance (60 days) ─────────────────────
    all_logs = []
    today = datetime.utcnow()
    
    # Map USNs to student IDs
    usn_to_id = {}
    for i, s in enumerate(students):
        usn_to_id[s["usn"]] = student_ids[i]
    
    # Generate 60 days of attendance for all Section A students
    section_a_students = [(s, student_ids[i]) for i, s in enumerate(students) if s["section"] == "A"]
    
    for day_offset in range(1, 61):
        date_obj = today - timedelta(days=day_offset)
        # Skip weekends
        if date_obj.weekday() >= 5:
            continue
        
        date_str = date_obj.strftime("%Y-%m-%d")
        
        for student, sid in section_a_students:
            for subject in cse_subjects[:4]:
                # Different attendance patterns per student
                if student["usn"] == "1XX19CS001":  # Ansika - 92% attendance
                    prob = 0.92
                elif student["usn"] == "1XX20CS004":  # Priya - declining trend
                    if day_offset <= 14:
                        prob = 0.3  # Recent: poor
                    elif day_offset <= 30:
                        prob = 0.6  # Mid: moderate
                    else:
                        prob = 0.95  # Older: good (shows decline)
                elif student["usn"] == "1XX20CS001":  # Alex - 85%
                    prob = 0.85
                elif student["usn"] == "1XX20CS002":  # Sarah - 70% (at risk)
                    prob = 0.70
                elif student["usn"] == "1XX21CS001":  # Rahul - 95% (top performer)
                    prob = 0.95
                elif student["usn"] == "1XX21CS002":  # Meera - 88%
                    prob = 0.88
                elif student["usn"] == "1XX21CS005":  # Nikhil - 60% (critical)
                    prob = 0.60
                else:
                    prob = 0.80
                
                rand = random.random()
                if rand < prob:
                    status = "PRESENT"
                    if random.random() < 0.1:
                        status = "LATE"
                    delay = random.randint(0, 10)
                else:
                    status = "ABSENT"
                    delay = 0
                
                hour_map = {"Data Structures": 9, "Algorithms": 10, "Operating Systems": 11, "Computer Networks": 13}
                hour = hour_map.get(subject, 9)
                
                log = {
                    "studentId": sid,
                    "usn": student["usn"],
                    "date": date_str,
                    "subject": subject,
                    "status": status,
                    "entryTimestamp": date_obj.replace(hour=hour, minute=delay) if status != "ABSENT" else None,
                    "exitTimestamp": date_obj.replace(hour=hour+1, minute=0) if status != "ABSENT" else None,
                    "durationInClassMins": random.randint(45, 60) if status != "ABSENT" else 0
                }
                all_logs.append(log)
    
    # Section B students (simpler generation)
    section_b_students = [(s, student_ids[i]) for i, s in enumerate(students) if s["section"] == "B"]
    for day_offset in range(1, 45):
        date_obj = today - timedelta(days=day_offset)
        if date_obj.weekday() >= 5:
            continue
        date_str = date_obj.strftime("%Y-%m-%d")
        
        for student, sid in section_b_students:
            for subject in cse_subjects[:4]:
                status = "PRESENT" if random.random() < 0.82 else "ABSENT"
                log = {
                    "studentId": sid,
                    "usn": student["usn"],
                    "date": date_str,
                    "subject": subject,
                    "status": status,
                    "entryTimestamp": date_obj.replace(hour=9) if status != "ABSENT" else None,
                    "durationInClassMins": 55 if status != "ABSENT" else 0
                }
                all_logs.append(log)
    
    # Insert in batches
    batch_size = 500
    for i in range(0, len(all_logs), batch_size):
        batch = all_logs[i:i + batch_size]
        await attendance_collection.insert_many(batch)
    print(f"✅ Inserted {len(all_logs)} historical attendance records across 60 days.")

    # ─── 5. Mock Disputes ────────────────────────────────────────────────────
    disputes = [
        {"usn": "1XX19CS001", "date": "2026-05-10", "subject": "Data Structures", "reason": "I was in the lab but marked absent. Can verify with lab supervisor.", "status": "PENDING", "createdAt": datetime.utcnow()},
        {"usn": "1XX20CS001", "date": "2026-05-12", "subject": "Operating Systems", "reason": "System glitch during face recognition.", "status": "APPROVED", "createdAt": datetime.utcnow()},
        {"usn": "1XX20CS002", "date": "2026-05-08", "subject": "Algorithms", "reason": "Was present but left early due to medical emergency.", "status": "PENDING", "createdAt": datetime.utcnow()},
        {"usn": "1XX21CS005", "date": "2026-05-13", "subject": "Computer Networks", "reason": "Face not recognized due to new glasses.", "status": "REJECTED", "createdAt": datetime.utcnow()},
    ]
    await dispute_collection.insert_many(disputes)
    print("✅ Inserted mock disputes.")

    # ─── 6. Gamification Stats ───────────────────────────────────────────────
    today_str = today.strftime("%Y-%m-%d")
    gamification = [
        {"usn": "1XX19CS001", "points": 1250, "badges": ["30 Day Streak", "Perfect Month", "Early Bird", "Subject Master"], "streakCount": 32, "lastPresentDate": today_str},
        {"usn": "1XX20CS004", "points": 50, "badges": ["First Step"], "streakCount": 1, "lastPresentDate": today_str},
        {"usn": "1XX20CS001", "points": 780, "badges": ["Week Warrior", "Early Bird", "Consistent"], "streakCount": 15, "lastPresentDate": today_str},
        {"usn": "1XX21CS001", "points": 1500, "badges": ["30 Day Streak", "Perfect Month", "Top Performer", "Semester Star"], "streakCount": 45, "lastPresentDate": today_str},
        {"usn": "1XX21CS002", "points": 620, "badges": ["Week Warrior", "Consistent"], "streakCount": 12, "lastPresentDate": today_str},
        {"usn": "1XX20CS002", "points": 200, "badges": ["First Step", "Comeback"], "streakCount": 3, "lastPresentDate": today_str},
        {"usn": "1XX21CS005", "points": 30, "badges": [], "streakCount": 0, "lastPresentDate": (today - timedelta(days=5)).strftime("%Y-%m-%d")},
    ]
    await gamification_collection.insert_many(gamification)
    print("✅ Inserted gamification stats for 7 students.")

    # ─── 7. Sample Audit Logs ────────────────────────────────────────────────
    audit_logs = [
        {
            "action": "LOGIN", "performedBy": "principal", "role": "principal",
            "targetType": "auth", "targetId": "principal",
            "details": {"display_name": "Dr. Kumar"},
            "timestamp": datetime.utcnow() - timedelta(hours=2),
            "date": today_str
        },
        {
            "action": "ATTENDANCE_MARK", "performedBy": "teacher1", "role": "teacher",
            "targetType": "attendance", "targetId": "1XX20CS001",
            "details": {"subject": "Data Structures", "status": "PRESENT", "method": "FACE_RECOGNITION"},
            "timestamp": datetime.utcnow() - timedelta(hours=1),
            "date": today_str
        },
        {
            "action": "ATTENDANCE_EDIT", "performedBy": "teacher1", "role": "teacher",
            "targetType": "attendance", "targetId": "1XX20CS004",
            "details": {"subject": "Algorithms", "old_status": "ABSENT", "new_status": "PRESENT", "reason": "Late entry approved"},
            "timestamp": datetime.utcnow() - timedelta(minutes=30),
            "date": today_str
        },
        {
            "action": "DISPUTE_RESOLVE", "performedBy": "principal", "role": "principal",
            "targetType": "dispute", "targetId": "1XX20CS001",
            "details": {"resolution": "APPROVED", "subject": "Operating Systems"},
            "timestamp": datetime.utcnow() - timedelta(minutes=15),
            "date": today_str
        },
        {
            "action": "NOTIFICATION_SEND", "performedBy": "system", "role": "system",
            "targetType": "notification", "targetId": "1XX21CS005",
            "details": {"type": "WHATSAPP", "reason": "Attendance below 75%"},
            "timestamp": datetime.utcnow() - timedelta(minutes=10),
            "date": today_str
        },
    ]
    await audit_collection.insert_many(audit_logs)
    print("✅ Inserted sample audit logs.")

    # 8. Academics Seeding
    default_assignments = [
        {"title": "MapReduce Implementation", "course": "CS501", "due": "2026-05-18", "submitted": 38, "total": 50, "createdAt": datetime.utcnow()},
        {"title": "Neural Network Report", "course": "CS502", "due": "2026-05-21", "submitted": 45, "total": 50, "createdAt": datetime.utcnow()},
        {"title": "Design Patterns Quiz", "course": "CS503", "due": "2026-05-19", "submitted": 22, "total": 50, "createdAt": datetime.utcnow()},
    ]
    await assignment_collection.insert_many(default_assignments)

    default_exams = [
        {"subject": "Distributed Systems", "date": "2026-05-20", "time": "10:00 AM", "room": "LH-301", "invigilator": "Dr. Wilson", "createdAt": datetime.utcnow()},
        {"subject": "Machine Learning", "date": "2026-05-22", "time": "02:00 PM", "room": "LH-102", "invigilator": "Prof. Chen", "createdAt": datetime.utcnow()},
        {"subject": "Software Engineering", "date": "2026-05-25", "time": "10:00 AM", "room": "Lab-4", "invigilator": "Dr. Rodriguez", "createdAt": datetime.utcnow()},
    ]
    await exam_collection.insert_many(default_exams)
    print("✅ Inserted mock assignments and exams.")

    print("\n🎉 ALIAS Enterprise seeding complete!")
    print(f"   📊 {len(student_ids)} students")
    print(f"   📅 {len(all_logs)} attendance records")
    print(f"   🏆 {len(gamification)} gamification profiles")
    print(f"   📝 {len(audit_logs)} audit entries")
    print(f"   ⚖️  {len(disputes)} disputes")

if __name__ == "__main__":
    asyncio.run(seed_data())
