import cv2
import numpy as np
from datetime import datetime
import threading

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False

class FaceTrackingService:
    def __init__(self):
        self.known_encodings = []
        self.known_names = []
        self.attendance = {}  # name -> {first_seen, last_seen, total_seconds}
        self.trackers = {}    # name -> {"tracker": tracker, "box": box}
        self.frame_count = 0
        self.RECOGNIZE_EVERY = 15
        self.lock = threading.Lock()
        
        # Fallback for when face_recognition is missing
        if not FACE_RECOGNITION_AVAILABLE:
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def add_known_face(self, name, image_path):
        if not FACE_RECOGNITION_AVAILABLE:
            return False
        try:
            img = face_recognition.load_image_file(image_path)
            encoding = face_recognition.face_encodings(img)[0]
            with self.lock:
                self.known_encodings.append(encoding)
                self.known_names.append(name)
            return True
        except Exception as e:
            print(f"Error loading face for {name}: {e}")
            return False

    def process_frame(self, frame):
        if not FACE_RECOGNITION_AVAILABLE:
            return self._process_frame_lightweight(frame)
            
        with self.lock:
            self.frame_count += 1
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            if self.frame_count % self.RECOGNIZE_EVERY == 0 or not self.trackers:
                locations = face_recognition.face_locations(rgb_small_frame)
                encodings = face_recognition.face_encodings(rgb_small_frame, locations)
                new_trackers = {}
                for enc, loc in zip(encodings, locations):
                    name = "Unknown"
                    if self.known_encodings:
                        matches = face_recognition.compare_faces(self.known_encodings, enc, tolerance=0.5)
                        if True in matches:
                            first_match_index = matches.index(True)
                            name = self.known_names[first_match_index]
                    top, right, bottom, left = [v * 4 for v in loc]
                    box = (left, top, right - left, bottom - top)
                    tracker = cv2.TrackerCSRT_create()
                    tracker.init(frame, box)
                    new_trackers[name] = {"tracker": tracker, "box": box}
                    self._log_attendance(name)
                self.trackers = new_trackers
            else:
                for name, data in list(self.trackers.items()):
                    success, box = data["tracker"].update(frame)
                    if success:
                        self.trackers[name]["box"] = box
                        self._log_attendance(name)
                    else:
                        del self.trackers[name]

            for name, data in self.trackers.items():
                x, y, w, h = [int(v) for v in data["box"]]
                color = (16, 185, 129) if name != "Unknown" else (239, 68, 68)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                label_y = y - 10 if y - 10 > 10 else y + 10
                cv2.putText(frame, name, (x, label_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            return frame

    def _process_frame_lightweight(self, frame):
        # Fallback to simple OpenCV detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (16, 185, 129), 2)
            cv2.putText(frame, "Detected", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (16, 185, 129), 2)
        return frame

    def _log_attendance(self, name):
        if name == "Unknown": return
        now = datetime.now()
        if name not in self.attendance:
            self.attendance[name] = {"first_seen": now, "last_seen": now, "total_seconds": 0}
        else:
            self.attendance[name]["last_seen"] = now
            delta = (now - self.attendance[name]["first_seen"]).total_seconds()
            self.attendance[name]["total_seconds"] = delta

    def get_attendance_report(self):
        with self.lock: return self.attendance
