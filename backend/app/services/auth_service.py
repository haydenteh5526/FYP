import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def create_refresh_token(user_id: uuid.UUID, remember_me: bool = False) -> str:
    days = (
        settings.REFRESH_TOKEN_EXPIRY_DAYS
        if remember_me
        else settings.REFRESH_TOKEN_EXPIRY_DAYS_SHORT
    )
    expire = datetime.now(timezone.utc) + timedelta(days=days)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_token(token: str, expected_type: str = "access") -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        # Reject tokens whose type doesn't match (e.g. using a refresh token
        # as an access token). Tokens minted before typing existed have no
        # "type" claim and are treated as access tokens for backward compat.
        token_type = payload.get("type", "access")
        if token_type != expected_type:
            return None
        return uuid.UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        return None


def create_oauth_state() -> str:
    """Short-lived signed token used as the OAuth `state` param (CSRF guard)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    payload = {"exp": expire, "type": "oauth_state"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def verify_oauth_state(state: str) -> bool:
    try:
        payload = jwt.decode(state, settings.JWT_SECRET, algorithms=["HS256"])
        return payload.get("type") == "oauth_state"
    except JWTError:
        return False
