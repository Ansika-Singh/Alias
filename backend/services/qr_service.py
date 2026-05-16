"""
Rotating QR Code Service for ALIAS
Generates time-based tokens that expire every 30 seconds.
Students must scan the live QR code to mark attendance, preventing proxy attendance.
"""

import hashlib
import hmac
import time
import os
import json
import base64
from datetime import datetime

# Secret key for TOTP generation
QR_SECRET = os.getenv("ALIAS_QR_SECRET", "alias-qr-secret-key-2026")

# Token rotation interval in seconds
TOKEN_INTERVAL = 30

# Grace period: accept tokens from the previous interval too
GRACE_PERIODS = 1


def _generate_token(secret: str, timestamp: int, session_id: str) -> str:
    """Generate a time-based token using HMAC-SHA256."""
    time_step = timestamp // TOKEN_INTERVAL
    message = f"{session_id}:{time_step}".encode('utf-8')
    token = hmac.new(secret.encode('utf-8'), message, hashlib.sha256).hexdigest()[:12]
    return token.upper()


def generate_qr_payload(session_id: str, subject: str, section: str, semester: int) -> dict:
    """
    Generate a QR code payload with a rotating token.
    This payload is what gets encoded into the QR code displayed by the teacher.
    
    Returns:
        dict with token, session info, and expiry timestamp
    """
    now = int(time.time())
    token = _generate_token(QR_SECRET, now, session_id)
    expires_at = ((now // TOKEN_INTERVAL) + 1) * TOKEN_INTERVAL
    
    payload = {
        "token": token,
        "session_id": session_id,
        "subject": subject,
        "section": section,
        "semester": semester,
        "generated_at": datetime.utcnow().isoformat(),
        "expires_in": expires_at - now,
        "interval": TOKEN_INTERVAL
    }
    
    # Create a compact base64-encoded string for QR encoding
    compact = base64.urlsafe_b64encode(
        json.dumps({
            "t": token,
            "s": session_id,
            "sub": subject,
            "sec": section,
            "sem": semester,
            "ts": now
        }).encode()
    ).decode()
    
    payload["qr_data"] = compact
    return payload


def validate_qr_token(token: str, session_id: str) -> dict:
    """
    Validate a scanned QR token.
    Checks the current time step and allows one grace period.
    
    Returns:
        dict with 'valid' bool and 'message' string
    """
    now = int(time.time())
    
    # Check current interval and grace periods
    for offset in range(GRACE_PERIODS + 1):
        check_time = now - (offset * TOKEN_INTERVAL)
        expected_token = _generate_token(QR_SECRET, check_time, session_id)
        
        if token.upper() == expected_token:
            return {
                "valid": True,
                "message": "Token verified successfully.",
                "delay_seconds": offset * TOKEN_INTERVAL
            }
    
    return {
        "valid": False,
        "message": "Token expired or invalid. Please scan the current QR code."
    }


def create_session_id(section: str, semester: int, subject: str, date: str = None) -> str:
    """Create a unique session ID for a class session."""
    if date is None:
        date = datetime.utcnow().strftime("%Y-%m-%d")
    raw = f"{section}-{semester}-{subject}-{date}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]
