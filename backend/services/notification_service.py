import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from database import notification_collection
from datetime import datetime

# ─── Twilio Configuration ────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "mock_sid")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "mock_token")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
TWILIO_SMS_NUMBER = os.getenv("TWILIO_SMS_NUMBER", "+1234567890")

# ─── SMTP Configuration ──────────────────────────────────────────────────────
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "mock_user@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "mock_password")


def get_twilio_client():
    if TWILIO_ACCOUNT_SID != "mock_sid" and TWILIO_AUTH_TOKEN != "mock_token":
        try:
            from twilio.rest import Client
            return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        except ImportError:
            print("[WARN] twilio package not installed. Using mock mode.")
    return None


# ─── WhatsApp Alerts ──────────────────────────────────────────────────────────
async def send_whatsapp_alert(to_number: str, student_name: str, attendance_pct: float, usn: str):
    message_body = (
        f"🏫 *ALIAS Attendance Alert*\n\n"
        f"Dear Parent,\n"
        f"Your ward *{student_name}* ({usn}) has current attendance of *{attendance_pct}%*, "
        f"which is below the required 75%.\n\n"
        f"Please ensure regular attendance to avoid academic penalties.\n\n"
        f"— ALIAS System"
    )
    
    client = get_twilio_client()
    if not client:
        print(f"[MOCK WHATSAPP] To: {to_number} | Msg: {message_body}")
        await log_notification(usn, "WHATSAPP", message_body, "MOCK_SID")
        return True

    try:
        formatted_to = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=message_body,
            to=formatted_to
        )
        await log_notification(usn, "WHATSAPP", message_body, message.sid)
        return True
    except Exception as e:
        print(f"Failed to send WhatsApp: {str(e)}")
        return False


# ─── SMS Alerts ───────────────────────────────────────────────────────────────
async def send_sms_alert(to_number: str, student_name: str, attendance_pct: float, usn: str):
    """Send an SMS alert to parent about low attendance."""
    message_body = (
        f"ALIAS Alert: {student_name} ({usn}) attendance is {attendance_pct}%, "
        f"below the 75% threshold. Please contact the institution."
    )
    
    client = get_twilio_client()
    if not client:
        print(f"[MOCK SMS] To: {to_number} | Msg: {message_body}")
        await log_notification(usn, "SMS", message_body, "MOCK_SMS_SID")
        return True
    
    try:
        message = client.messages.create(
            from_=TWILIO_SMS_NUMBER,
            body=message_body,
            to=to_number
        )
        await log_notification(usn, "SMS", message_body, message.sid)
        return True
    except Exception as e:
        print(f"Failed to send SMS: {str(e)}")
        return False


# ─── Email Reports ────────────────────────────────────────────────────────────
async def send_email_report(to_email: str, student_name: str, attendance_pct: float, usn: str, report_data: str = ""):
    """Send an email attendance report to parent."""
    subject = f"ALIAS Attendance Report: {student_name} ({usn})"
    
    html_body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 24px; color: white;">
                <h1 style="margin: 0; font-size: 24px;">📊 ALIAS Attendance Report</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Cambridge Institute of Technology</p>
            </div>
            <div style="padding: 24px;">
                <p>Dear Parent,</p>
                <p>Please find the attendance report for your ward:</p>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #666;">Student</td><td style="padding: 8px 0; font-weight: 600;">{student_name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">USN</td><td style="padding: 8px 0; font-weight: 600;">{usn}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Attendance</td>
                            <td style="padding: 8px 0; font-weight: 700; color: {'#dc2626' if attendance_pct < 75 else '#16a34a'}; font-size: 18px;">
                                {attendance_pct}%
                            </td>
                        </tr>
                    </table>
                </div>
                
                {'<p style="color: #dc2626; font-weight: 600;">⚠️ Attendance is below the required 75% threshold.</p>' if attendance_pct < 75 else '<p style="color: #16a34a;">✅ Attendance is in good standing.</p>'}
                
                {f'<div style="margin-top: 16px; padding: 12px; background: #f0f0f0; border-radius: 6px; font-size: 14px;">{report_data}</div>' if report_data else ''}
                
                <p style="margin-top: 24px; color: #666; font-size: 13px;">
                    This is an automated report generated by the ALIAS system.<br>
                    For queries, contact the administration office.
                </p>
            </div>
            <div style="background: #f8f9fa; padding: 12px 24px; text-align: center; font-size: 12px; color: #999;">
                © 2026 ALIAS - Automated Live Identification & Attendance System
            </div>
        </div>
    </body>
    </html>
    """
    
    if SMTP_USER == "mock_user@gmail.com":
        print(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        await log_notification(usn, "EMAIL", f"HTML email report sent to {to_email}", "MOCK_EMAIL_ID")
        return True

    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = f"ALIAS System <{SMTP_USER}>"
    msg['To'] = to_email
    
    # Plain text fallback
    text_body = f"ALIAS Attendance Report\n\nStudent: {student_name} ({usn})\nAttendance: {attendance_pct}%\n\n{report_data}"
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        await log_notification(usn, "EMAIL", f"Report sent to {to_email}", "SENT")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


# ─── Notification Logger ─────────────────────────────────────────────────────
async def log_notification(usn: str, type: str, message: str, sid: str):
    await notification_collection.insert_one({
        "usn": usn,
        "type": type,
        "message": message,
        "sid": sid,
        "sentAt": datetime.now()
    })


# ─── Unified Alert Checker ───────────────────────────────────────────────────
async def check_and_notify_low_attendance(student: dict, attendance_pct: float):
    """
    Check if a student's attendance is below threshold and send alerts
    via all available channels: WhatsApp, SMS, and Email.
    """
    if attendance_pct < 75:
        parent_contact = student.get("parentContact")
        parent_email = student.get("parentEmail")
        
        notifications_sent = []
        
        if parent_contact:
            await send_whatsapp_alert(parent_contact, student["name"], attendance_pct, student["usn"])
            notifications_sent.append("WHATSAPP")
            
            await send_sms_alert(parent_contact, student["name"], attendance_pct, student["usn"])
            notifications_sent.append("SMS")
        
        if parent_email:
            await send_email_report(parent_email, student["name"], attendance_pct, student["usn"])
            notifications_sent.append("EMAIL")
        
        return {"notified": True, "channels": notifications_sent}
            
    return {"notified": False, "channels": []}
