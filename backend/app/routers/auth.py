import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db
from app.models.base import User
from app.services.auth_service import create_access_token, hash_password, verify_password

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str




class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterResponse(BaseModel):
    message: str
    requires_verification: bool = True


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Email already registered")

    token = secrets.token_urlsafe(32)

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        display_name=req.display_name,
        verification_token=token,
        is_verified=False,
    )
    db.add(user)
    await db.commit()

    # Send verification email
    from app.services.email_service import send_verification_email
    send_verification_email(req.email, token)

    return RegisterResponse(message="Verification email sent. Please check your inbox.")


@router.get("/verify")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(400, "Invalid or expired verification link")

    user.is_verified = True
    user.verification_token = None
    await db.commit()
    return {"message": "Email verified successfully. You can now sign in."}


class LoginResponse(BaseModel):
    access_token: str | None = None
    token_type: str = "bearer"
    requires_2fa: bool = False


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    if not user.is_verified:
        raise HTTPException(403, "Please verify your email before signing in")

    if user.totp_secret:
        # 2FA enabled — require TOTP code
        return LoginResponse(requires_2fa=True)

    return LoginResponse(access_token=create_access_token(user.id))


class Verify2FARequest(BaseModel):
    email: EmailStr
    password: str
    code: str


@router.post("/login/2fa", response_model=TokenResponse)
async def login_2fa(req: Verify2FARequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    import pyotp
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(401, "Invalid 2FA code")

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/2fa/setup")
async def setup_2fa(db: AsyncSession = Depends(get_db), user_id=Depends(get_current_user_id)):
    import base64
    import io

    import pyotp
    import qrcode

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    secret = pyotp.random_base32()
    user.totp_secret = secret
    await db.commit()

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=user.email, issuer_name="DocVault")

    # Generate QR code as base64
    qr = qrcode.make(uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}", "uri": uri}


@router.post("/2fa/disable")
async def disable_2fa(db: AsyncSession = Depends(get_db), user_id=Depends(get_current_user_id)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()
    user.totp_secret = None
    await db.commit()
    return {"message": "2FA disabled"}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        # Don't reveal whether email exists
        return {"message": "If the email exists, the password has been reset"}
    user.hashed_password = hash_password(req.new_password)
    await db.commit()
    return {"message": "If the email exists, the password has been reset"}


@router.delete("/account", status_code=204)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    user_id=Depends(get_current_user_id),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        await db.delete(user)
        await db.commit()


@router.get("/oauth/google")
async def oauth_google_redirect():
    """Redirect user to Cognito hosted UI for Google OAuth."""
    from app.config import settings
    if not settings.COGNITO_DOMAIN:
        raise HTTPException(501, "OAuth not configured")
    url = (
        f"https://{settings.COGNITO_DOMAIN}/oauth2/authorize"
        f"?client_id={settings.COGNITO_CLIENT_ID}"
        f"&response_type=code"
        f"&scope=openid+email+profile"
        f"&redirect_uri={settings.COGNITO_REDIRECT_URI}"
        f"&identity_provider=Google"
    )
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url)


@router.post("/oauth/callback", response_model=TokenResponse)
async def oauth_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Exchange Cognito auth code for token, create/login user."""
    import httpx

    from app.config import settings
    # Exchange code for tokens with Cognito
    token_url = f"https://{settings.COGNITO_DOMAIN}/oauth2/token"
    resp = httpx.post(token_url, data={
        "grant_type": "authorization_code",
        "client_id": settings.COGNITO_CLIENT_ID,
        "code": code,
        "redirect_uri": settings.COGNITO_REDIRECT_URI,
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    if resp.status_code != 200:
        raise HTTPException(401, "OAuth token exchange failed")
    # Decode ID token to get email
    import base64
    import json
    id_token = resp.json()["id_token"]
    payload = json.loads(base64.b64decode(id_token.split(".")[1] + "=="))
    email = payload["email"]

    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(email=email, hashed_password=hash_password("oauth-managed"), cognito_id=payload.get("sub"))
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id))
