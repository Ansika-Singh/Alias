"""
Audit Service for ALIAS
Logs all attendance modifications, role changes, and administrative actions.
Provides a tamper-evident audit trail for compliance and accountability.
"""

import hashlib
import json
from datetime import datetime
from database import database

# Audit log collection
audit_collection = database.get_collection("audit_logs")


def compute_hash(log_entry: dict) -> str:
    """Compute SHA-256 hash of a log entry (excluding the hash itself)."""
    # Create a copy and remove volatile fields for hashing if necessary
    # Or just hash the deterministic parts
    data = {
        "action": log_entry.get("action"),
        "performedBy": log_entry.get("performedBy"),
        "role": log_entry.get("role"),
        "targetType": log_entry.get("targetType"),
        "targetId": log_entry.get("targetId"),
        "details": log_entry.get("details", {}),
        "timestamp": log_entry.get("timestamp").isoformat() if hasattr(log_entry.get("timestamp"), "isoformat") else str(log_entry.get("timestamp")),
        "previousHash": log_entry.get("previousHash", "GENESIS")
    }
    encoded = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(encoded).hexdigest()


async def log_action(
    action: str,
    performed_by: str,
    role: str,
    target_type: str,
    target_id: str,
    details: dict = None,
    ip_address: str = None
):
    """
    Log an auditable action.
    
    Args:
        action: The action performed (e.g., 'ATTENDANCE_EDIT', 'STUDENT_ADD', 'ROLE_CHANGE')
        performed_by: Username/ID of the person who performed the action
        role: Role of the performer (teacher, principal, admin)
        target_type: Type of entity affected (student, attendance, timetable)
        target_id: ID of the affected entity
        details: Additional details about the change (before/after values)
        ip_address: IP address of the request origin
    """
    # Get the last log entry to link the chain
    try:
        last_log = await audit_collection.find_one(sort=[("timestamp", -1)])
        previous_hash = last_log.get("hash", "GENESIS") if last_log else "GENESIS"
    except Exception:
        previous_hash = "GENESIS"

    log_entry = {
        "action": action,
        "performedBy": performed_by,
        "role": role,
        "targetType": target_type,
        "targetId": target_id,
        "details": details or {},
        "ipAddress": ip_address,
        "timestamp": datetime.utcnow(),
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "previousHash": previous_hash
    }
    
    # Compute current hash
    log_entry["hash"] = compute_hash(log_entry)
    
    try:
        await audit_collection.insert_one(log_entry)
    except Exception as e:
        print(f"[Audit] Warning: Could not write audit log: {e}")
    return log_entry


async def verify_integrity() -> dict:
    """
    Verify the integrity of the entire audit chain.
    Returns a report of any detected tampering.
    """
    cursor = audit_collection.find().sort("timestamp", 1)
    logs = await cursor.to_list(length=None)
    
    if not logs:
        return {"status": "success", "message": "Audit log is empty.", "verified_count": 0}
    
    expected_previous_hash = "GENESIS"
    for i, log in enumerate(logs):
        # 1. Check if previousHash matches
        if log.get("previousHash") != expected_previous_hash:
            return {
                "status": "failure",
                "message": f"Chain broken at entry {i} (ID: {log['_id']}). Expected previous hash {expected_previous_hash[:8]} but found {log.get('previousHash', 'None')[:8]}",
                "verified_count": i
            }
        
        # 2. Check if current hash is correct
        actual_hash = compute_hash(log)
        if log.get("hash") != actual_hash:
            return {
                "status": "failure",
                "message": f"Tampering detected at entry {i} (ID: {log['_id']}). Hash mismatch.",
                "verified_count": i
            }
        
        expected_previous_hash = log.get("hash")
    
    return {
        "status": "success", 
        "message": f"All {len(logs)} audit entries verified successfully.", 
        "verified_count": len(logs)
    }


async def get_audit_logs(
    limit: int = 50,
    action_filter: str = None,
    user_filter: str = None,
    date_from: str = None,
    date_to: str = None
) -> list:
    """
    Retrieve audit logs with optional filters.
    
    Args:
        limit: Maximum number of logs to return
        action_filter: Filter by action type
        user_filter: Filter by performer
        date_from: Start date (YYYY-MM-DD)
        date_to: End date (YYYY-MM-DD)
    """
    query = {}
    
    if action_filter:
        query["action"] = action_filter
    
    if user_filter:
        query["performedBy"] = user_filter
    
    if date_from or date_to:
        date_query = {}
        if date_from:
            date_query["$gte"] = date_from
        if date_to:
            date_query["$lte"] = date_to
        query["date"] = date_query
    
    cursor = audit_collection.find(query).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for JSON serialization
    for log in logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = log["timestamp"].isoformat()
    
    return logs


# Predefined action types for consistency
class AuditActions:
    # Attendance
    ATTENDANCE_MARK = "ATTENDANCE_MARK"
    ATTENDANCE_EDIT = "ATTENDANCE_EDIT"
    ATTENDANCE_BULK = "ATTENDANCE_BULK_UPLOAD"
    ATTENDANCE_QR = "ATTENDANCE_QR_SCAN"
    
    # Students
    STUDENT_ADD = "STUDENT_ADD"
    STUDENT_EDIT = "STUDENT_EDIT"
    STUDENT_DELETE = "STUDENT_DELETE"
    STUDENT_ENROLL = "STUDENT_ENROLL"
    
    # Admin
    ROLE_CHANGE = "ROLE_CHANGE"
    SETTINGS_CHANGE = "SETTINGS_CHANGE"
    DISPUTE_RESOLVE = "DISPUTE_RESOLVE"
    
    # Reports
    REPORT_GENERATE = "REPORT_GENERATE"
    NOTIFICATION_SEND = "NOTIFICATION_SEND"
    
    # Auth
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    LOGIN_FAILED = "LOGIN_FAILED"
