try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
import cv2
import numpy as np

def generate_encodings(image_bytes: bytes) -> list:
    """
    Converts image bytes to a numpy array, finds faces, and generates encodings.
    Returns a list of encodings (as standard python lists for MongoDB storage).
    """
    if not FACE_RECOGNITION_AVAILABLE:
        print("Warning: face_recognition not installed. Returning empty encodings.")
        return []

    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert from BGR (OpenCV) to RGB (face_recognition)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Find faces in the image
    face_locations = face_recognition.face_locations(rgb_img)
    
    # Generate encodings for each face
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
    
    # Convert numpy arrays to standard python lists
    return [encoding.tolist() for encoding in face_encodings]
