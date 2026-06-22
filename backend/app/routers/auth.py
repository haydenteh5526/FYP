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


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Email already registered")

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        display_name=req.display_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    return TokenResponse(access_token=create_access_token(user.id))


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
