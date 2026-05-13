import cv2
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
import numpy as np
import asyncio
import time
import requests
from datetime import datetime
from database import student_collection
from services.liveness import check_liveness

# Distance threshold for face matching
TOLERANCE = 0.55

async def fetch_known_faces():
    """Fetches all enrolled students and their encodings from DB."""
    print("Fetching known encodings from Database...")
    known_encodings = []
    known_names = []
    
    cursor = student_collection.find({"enrollmentStatus": "ENROLLED"})
    async for student in cursor:
        if "faceEncodings" in student and len(student["faceEncodings"]) > 0:
            for encoding in student["faceEncodings"]:
                known_encodings.append(np.array(encoding))
                known_names.append(student["usn"]) # Use USN as identifier
                
    print(f"Loaded {len(known_names)} encodings.")
    return known_encodings, known_names

def run_camera(known_encodings, known_names):
    """Runs the live OpenCV camera feed."""
    video_capture = cv2.VideoCapture(0)
    
    if not video_capture.isOpened():
        print("Error: Could not open webcam.")
        return

    # Track blink status per student
    liveness_status = {}
    
    # Track last ping time to avoid spamming the API (debounce)
    last_ping_time = {}
    
    print("Starting live feed. Press 'q' to quit.")
    
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
            
        # Resize frame of video to 1/4 size for faster face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find all the faces, encodings, and landmarks in the current frame
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        face_landmarks_list = face_recognition.face_landmarks(rgb_small_frame, face_locations)
        
        face_names = []
        
        for i, face_encoding in enumerate(face_encodings):
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=TOLERANCE)
            name = "Unknown"
            
            # Use the known face with the smallest distance
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)
            
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_names[best_match_index]
                    
                    # Liveness Check
                    landmarks = face_landmarks_list[i]
                    is_blinking = check_liveness(landmarks)
                    
                    if is_blinking:
                        liveness_status[name] = True
                    
                    if liveness_status.get(name, False):
                        # Face is live and matched. Ping the backend API.
                        current_time = time.time()
                        # Only ping every 10 seconds per student to avoid overloading DB
                        if current_time - last_ping_time.get(name, 0) > 10:
                            try:
                                payload = {
                                    "usn": name, 
                                    "timestamp": datetime.utcnow().isoformat()
                                }
                                # Run ping in background or quick synchronous call
                                res = requests.post("http://localhost:8000/api/attendance/log", json=payload, timeout=2)
                                last_ping_time[name] = current_time
                            except Exception as e:
                                print(f"API Ping failed for {name}: {e}")
                    else:
                        name = f"{name} (Blink to Verify)"
            
            face_names.append(name)
            
        # Display the results
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            # Draw a box around the face
            color = (0, 0, 255) if "Unknown" in name or "Blink" in name else (0, 255, 0)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.6, (255, 255, 255), 1)
            
        cv2.imshow('ALIAS - Live Attendance', frame)

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    if not FACE_RECOGNITION_AVAILABLE:
        print("Error: face_recognition is not installed. Please install dlib and face_recognition.")
        print("Tip: Use the 'Desktop development with C++' workload in Visual Studio Build Tools.")
    else:
        # Run async fetch, then run synchronous camera loop
        loop = asyncio.get_event_loop()
        known_encodings, known_names = loop.run_until_complete(fetch_known_faces())
        
        run_camera(known_encodings, known_names)
