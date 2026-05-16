import requests
import time
import random
import sys

BASE_URL = "http://localhost:8000/api"

STUDENTS = [
    {"usn": "1XX20CS001", "name": "Abhishek Kumar"},
    {"usn": "1XX20CS002", "name": "Aditya Raj"},
    {"usn": "1XX20CS003", "name": "Ananya Singh"},
    {"usn": "1XX20CS004", "name": "Arjun Sharma"},
    {"usn": "1XX20CS005", "name": "Bhavana K"},
    {"usn": "1XX20CS006", "name": "Chetan S"},
    {"usn": "1XX20CS007", "name": "Deepak R"},
    {"usn": "1XX20CS008", "name": "Esha Gupta"},
]

def simulate_scans():
    print("Starting ALIAS Enterprise QR Simulation")
    
    # 1. Get active session info
    # We'll assume a session is already started in the UI
    # or we can try to find one if we had an endpoint for that.
    # For now, let's just ask the user to provide the session_id and token or try to fetch it.
    
    print("Step 1: Fetching active session info...")
    try:
        resp = requests.get(f"{BASE_URL}/qr/session/A/6/Data%20Structures")
        if resp.status_code != 200:
            print("No active session found. Please start a session in the UI first.")
            return
        
        session_data = resp.json()["data"]
        session_id = session_data["session_id"]
        token = session_data["token"]
        print(f"Found active session: {session_id}")
        print(f"Current token: {token}")
    except Exception as e:
        print(f"Error connecting to backend: {e}")
        return

    # 2. Simulate scans
    print("\nStep 2: Simulating scans...")
    random.shuffle(STUDENTS)
    
    for student in STUDENTS[:5]: # Simulate 5 scans
        print(f"⏳ Simulating scan for {student['name']} ({student['usn']})...")
        
        # We need the CURRENT token, but since it rotates, we might need to fetch it again
        # for every scan if we take too long.
        current_token = requests.get(f"{BASE_URL}/qr/session/A/6/Data%20Structures").json()["data"]["token"]
        
        payload = {
            "token": current_token,
            "session_id": session_id,
            "usn": student["usn"],
            "subject": "Data Structures"
        }
        
        scan_resp = requests.post(f"{BASE_URL}/qr/validate", json=payload)
        if scan_resp.status_code == 200:
            print(f"Success: {scan_resp.json()['message']}")
        else:
            print(f"Failed: {scan_resp.json().get('message', 'Unknown error')}")
        
        time.sleep(random.uniform(1, 4)) # Random delay between scans

    print("\nSimulation complete. Check your dashboard for the live feed!")

if __name__ == "__main__":
    simulate_scans()
