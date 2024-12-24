import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

def send_confirmation_email(email: str, token: str):
    """Send confirmation email to user"""
    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = email
    msg['Subject'] = "Confirm your PhotoCloud account"
    
    confirmation_url = f"{settings.FRONTEND_URL}/confirm-email?token={token}"
    body = f"""
    Welcome to PhotoCloud!
    
    Please confirm your email address by clicking the link below:
    {confirmation_url}
    
    If you didn't create this account, you can safely ignore this email.
    """
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")