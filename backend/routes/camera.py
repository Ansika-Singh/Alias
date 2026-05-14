from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
import cv2
from services.tracking_service import FaceTrackingService
import os

router = APIRouter()
tracker_service = FaceTrackingService()

# Placeholder for initializing known faces (in production, this would load from a DB)
# For now, let's look for any images in a 'data/faces' folder if it exists
def init_faces():
    faces_dir = "data/faces"
    if os.path.exists(faces_dir):
        for file in os.listdir(faces_dir):
            if file.endswith((".jpg", ".png", ".jpeg")):
                name = os.path.splitext(file)[0].replace("_", " ").title()
                tracker_service.add_known_face(name, os.path.join(faces_dir, file))

# Run once at module load or app startup
# init_faces() 

def generate_frames():
    # Use 0 for webcam or a path to a video file for testing
    # If on a server, we would use a RTSP/HTTP stream URL from the camera node
    cap = cv2.VideoCapture(0) 
    
    if not cap.isOpened():
        # Fallback to a sample video if webcam is not available
        sample_path = "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/classroom.mp4"
        cap = cv2.VideoCapture(sample_path)

    while True:
        success, frame = cap.read()
        if not success:
            # If it's a file, loop back to start
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
            
        # Apply the Detect-then-Track logic
        processed_frame = tracker_service.process_frame(frame)
        
        # Encode as JPG
        ret, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@router.get("/stream")
async def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@router.get("/attendance")
async def get_current_attendance():
    return tracker_service.get_attendance_report()
