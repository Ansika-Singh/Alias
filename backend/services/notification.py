import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client
import os

# Twilio Mock Configuration
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "mock_sid")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "mock_token")
TWILIO_WHATSAPP_NUMBER = "whatsapp:+14155238886" # Twilio Sandbox Number

# SMTP Mock Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.environ.get("SMTP_USER", "mock_user@gmail.com")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "mock_password")

def send_email(to_email: str, subject: str, body: str):
    """Sends an email via SMTP. Uses mock logic if credentials are not set."""
    if SMTP_USER == "mock_user@gmail.com":
        print(f"[MOCK EMAIL] To: {to_email} | Subject: {subject} | Body: {body}")
        return True
        
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_whatsapp(to_number: str, message: str):
    """Sends a WhatsApp message via Twilio. Uses mock logic if credentials are not set."""
    if TWILIO_ACCOUNT_SID == "mock_sid":
        print(f"[MOCK WHATSAPP] To: {to_number} | Msg: {message}")
        return True
        
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        # Ensure number is formatted correctly
        formatted_number = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number
        
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=message,
            to=formatted_number
        )
        return True
    except Exception as e:
        print(f"Failed to send WhatsApp message: {e}")
        return False
