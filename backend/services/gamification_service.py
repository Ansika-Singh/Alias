from database import gamification_collection
from datetime import datetime, timedelta

async def update_student_streak(usn: str):
    """
    Updates the attendance streak for a student.
    If they were present yesterday, increment streak.
    If they missed a day, reset streak (unless it was a holiday/weekend - simplified for now).
    """
    today_str = datetime.now().strftime("%Y-%m-%d")
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    data = await gamification_collection.find_one({"usn": usn})
    
    if not data:
        data = {
            "usn": usn,
            "points": 10,  # Starting bonus
            "badges": ["First Step"],
            "streakCount": 1,
            "lastPresentDate": today_str
        }
        await gamification_collection.insert_one(data)
        return data

    if data.get("lastPresentDate") == today_str:
        return data # Already updated today

    if data.get("lastPresentDate") == yesterday_str:
        data["streakCount"] += 1
        data["points"] += 5 * data["streakCount"] # Bonus points for higher streaks
    else:
        data["streakCount"] = 1
        data["points"] += 5

    data["lastPresentDate"] = today_str

    # Add badges based on streaks
    if data["streakCount"] == 10 and "10 Day Streak" not in data["badges"]:
        data["badges"].append("10 Day Streak")
        data["points"] += 100
    elif data["streakCount"] == 30 and "Perfect Month" not in data["badges"]:
        data["badges"].append("Perfect Month")
        data["points"] += 500

    await gamification_collection.replace_one({"usn": usn}, data)
    return data

async def get_student_stats(usn: str):
    return await gamification_collection.find_one({"usn": usn})
