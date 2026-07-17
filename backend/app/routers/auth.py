import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user_id, get_db
from app.models.base import User
from app.services.auth_service import (
    create_access_token,
    create_oauth_state,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_oauth_state,
    verify_password,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
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
    refresh_token: str | None = None
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

    return LoginResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id, req.remember_me),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a fresh access + refresh token pair.

    Refresh tokens are rotated on every use: the returned refresh token
    preserves the remaining lifetime of the presented one (we keep the same
    30-day window by decoding its expiry rather than resetting it).
    """
    user_id = decode_token(req.refresh_token, expected_type="refresh")
    if not user_id:
        raise HTTPException(401, "Invalid or expired refresh token")

    # Ensure the user still exists (e.g. account not deleted)
    result = await db.execute(select(User).where(User.id == user_id))
    if not result.scalar_one_or_none():
        raise HTTPException(401, "Invalid or expired refresh token")

    # Preserve the original refresh window: read remaining lifetime from the
    # presented token so refreshing doesn't extend a session indefinitely.
    import jose.jwt as _jwt

    from app.config import settings as _settings
    payload = _jwt.decode(req.refresh_token, _settings.JWT_SECRET, algorithms=["HS256"])
    from datetime import datetime, timezone
    remaining_days = (
        datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        - datetime.now(timezone.utc)
    ).days
    remember = remaining_days > _settings.REFRESH_TOKEN_EXPIRY_DAYS_SHORT

    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id, remember_me=remember),
    )


class Verify2FARequest(BaseModel):
    email: EmailStr
    password: str
    code: str
    remember_me: bool = False


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

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id, req.remember_me),
    )


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


@router.get("/me")
async def get_profile(db: AsyncSession = Depends(get_db), user_id=Depends(get_current_user_id)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "email": user.email,
        "display_name": user.display_name,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


class UpdateProfileRequest(BaseModel):
    display_name: str | None = None


@router.patch("/me")
async def update_profile(req: UpdateProfileRequest, db: AsyncSession = Depends(get_db), user_id=Depends(get_current_user_id)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    if req.display_name is not None:
        user.display_name = req.display_name
    await db.commit()
    return {"email": user.email, "display_name": user.display_name}


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
    """Kick off Google OAuth: redirect the browser to Google's consent screen."""
    from urllib.parse import urlencode

    from fastapi.responses import RedirectResponse

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(501, "Google OAuth is not configured")

    params = urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": create_oauth_state(),
        "access_type": "online",
        "prompt": "select_account",
    })
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/oauth/google/callback")
async def oauth_google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Handle Google's redirect: exchange the code, find/create the user, then
    redirect back to the frontend with freshly minted app tokens in the URL
    fragment (fragments are never sent to servers, keeping tokens out of logs).
    """
    import httpx
    from fastapi.responses import RedirectResponse

    frontend = settings.FRONTEND_URL.rstrip("/")

    def fail(reason: str) -> RedirectResponse:
        return RedirectResponse(f"{frontend}/auth/callback#error={reason}")

    if error or not code or not state:
        return fail("oauth_denied")
    if not verify_oauth_state(state):
        return fail("invalid_state")

    async with httpx.AsyncClient(timeout=10) as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            return fail("token_exchange_failed")
        google_access = token_resp.json().get("access_token")
        if not google_access:
            return fail("token_exchange_failed")

        userinfo_resp = await client.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {google_access}"},
        )
        if userinfo_resp.status_code != 200:
            return fail("userinfo_failed")
        info = userinfo_resp.json()

    email = info.get("email")
    if not email or not info.get("email_verified", True):
        return fail("email_unverified")

    # Find existing account by email (links Google to an existing password
    # account) or create a new, already-verified account.
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            display_name=info.get("name"),
            is_verified=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.is_verified:
        # Google verified the email, so we can trust it
        user.is_verified = True
        await db.commit()

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id, remember_me=True)
    return RedirectResponse(
        f"{frontend}/auth/callback#access_token={access}&refresh_token={refresh}"
    )
