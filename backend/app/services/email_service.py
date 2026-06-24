import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings


def send_verification_email(to_email: str, token: str) -> None:
    """Send verification email via SMTP, or log to console in dev mode."""
    verify_url = f"{settings.FRONTEND_URL}/verify?token={token}"

    subject = "Verify your DocVault account"
    html = f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #666; margin-bottom: 24px;">Click the button below to verify your DocVault account.</p>
        <a href="{verify_url}" style="display: inline-block; background: linear-gradient(135deg, #5b21b6, #7c3aed); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Verify Email
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't create an account, you can ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Or copy this link: {verify_url}</p>
    </div>
    """

    if not settings.SMTP_HOST:
        # Dev mode — print to console
        print(f"\n{'='*50}")
        print("📧 VERIFICATION EMAIL (dev mode)")
        print(f"To: {to_email}")
        print(f"Verify URL: {verify_url}")
        print(f"{'='*50}\n")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        if settings.SMTP_PORT == 587:
            server.starttls()
        if settings.SMTP_USER:
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.send_message(msg)
