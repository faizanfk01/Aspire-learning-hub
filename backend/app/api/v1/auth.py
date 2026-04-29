import base64
import json
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import quote_plus, urlencode

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.user_otp import UserOTP
from app.schemas.user import OTPVerify, Token, UserCreate, UserRead
from app.services import email_service
from app.services.otp_service import generate_code

_GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_INFO_URL  = "https://www.googleapis.com/oauth2/v3/userinfo"

router = APIRouter()

_OTP_TTL_MINUTES = 10


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── Signup — creates inactive user + sends OTP ───────────────────────────────

@router.post("/signup", status_code=202)
def signup(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == user_in.email).first()

    if existing:
        if existing.is_active:
            raise HTTPException(status_code=400, detail="Email already registered")
        existing.full_name = user_in.full_name
        existing.hashed_password = get_password_hash(user_in.password)
        user = existing
    else:
        user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=UserRole.standard,
            is_active=False,
        )
        db.add(user)
        db.flush()

    otp_code = generate_code()
    expires  = _utcnow() + timedelta(minutes=_OTP_TTL_MINUTES)

    otp_record = db.query(UserOTP).filter(UserOTP.user_id == user.id).first()
    if otp_record:
        otp_record.code       = otp_code
        otp_record.expires_at = expires
    else:
        db.add(UserOTP(user_id=user.id, code=otp_code, expires_at=expires))

    db.commit()

    background_tasks.add_task(
        email_service.send_otp_email,
        user_in.email,
        user_in.full_name,
        otp_code,
    )

    return {"message": "OTP sent to your email."}


# ── Verify OTP — activate user + return JWT ───────────────────────────────────

@router.post("/verify-otp", response_model=Token)
def verify_otp_and_activate(data: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=400,
            detail="No pending registration for this email. Please sign up first.",
        )
    if user.is_active:
        raise HTTPException(status_code=400, detail="Account already verified. Please log in.")

    otp_record = db.query(UserOTP).filter(UserOTP.user_id == user.id).first()
    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No verification code found. Please sign up again.",
        )

    expires = otp_record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if _utcnow() > expires:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please sign up again.",
        )

    if otp_record.code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    user.is_active = True
    db.delete(otp_record)
    db.commit()
    db.refresh(user)

    return {"access_token": create_access_token(data={"sub": user.email}), "token_type": "bearer"}


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox for the verification code.",
        )
    return {"access_token": create_access_token(data={"sub": user.email}), "token_type": "bearer"}


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


# ── Forgot Password ───────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str


@router.post("/forgot-password", status_code=202)
def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == data.email,
        User.is_active == True,  # noqa: E712
    ).first()

    if user:
        reset_token = create_access_token(
            data={"sub": user.email, "purpose": "password_reset"},
            expires_delta=timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        )
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        background_tasks.add_task(
            email_service.send_password_reset_email,
            user.email,
            user.full_name,
            reset_link,
        )

    # Always return the same response so we don't leak whether an email exists.
    return {"message": "If that email is registered, a reset link has been sent."}


# ── Reset Password ────────────────────────────────────────────────────────────

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("purpose") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token.")
        email: str | None = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid reset token.")
    except JWTError:
        raise HTTPException(status_code=400, detail="Reset link has expired or is invalid.")

    user = db.query(User).filter(
        User.email == email,
        User.is_active == True,  # noqa: E712
    ).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}


# ── Google OAuth ──────────────────────────────────────────────────────────────

def _google_redirect_uri() -> str:
    return f"{settings.BACKEND_URL}/api/v1/auth/google/callback"


@router.get("/google/login")
def google_login(next: str = "/"):
    """Redirect the browser to Google's consent screen."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured.")

    state = base64.urlsafe_b64encode(
        json.dumps({"next": next}).encode()
    ).decode().rstrip("=")

    qs = urlencode({
        "client_id":     settings.GOOGLE_CLIENT_ID,
        "redirect_uri":  _google_redirect_uri(),
        "response_type": "code",
        "scope":         "openid email profile",
        "state":         state,
        "access_type":   "offline",
        "prompt":        "select_account",
    })
    return RedirectResponse(f"{_GOOGLE_AUTH_URL}?{qs}")


@router.get("/google/callback")
def google_callback(
    code: str = "",
    state: str = "",
    error: str = "",
    db: Session = Depends(get_db),
):
    """Google redirects here after the user grants (or denies) consent."""
    login_url = f"{settings.FRONTEND_URL}/login"

    if error or not code:
        return RedirectResponse(f"{login_url}?error=google_denied")

    # Decode state to recover the original `next` destination.
    next_url = "/"
    try:
        # Restore stripped base64 padding before decoding.
        padded = state + "=" * (-len(state) % 4)
        state_data = json.loads(base64.urlsafe_b64decode(padded).decode())
        raw_next = state_data.get("next", "/")
        next_url = raw_next if isinstance(raw_next, str) and raw_next.startswith("/") else "/"
    except Exception:
        pass

    # Exchange authorisation code for an access token, then fetch the profile.
    try:
        with httpx.Client(timeout=10) as client:
            token_resp = client.post(_GOOGLE_TOKEN_URL, data={
                "code":          code,
                "client_id":     settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri":  _google_redirect_uri(),
                "grant_type":    "authorization_code",
            })
            token_resp.raise_for_status()
            google_token = token_resp.json().get("access_token", "")

            info_resp = client.get(
                _GOOGLE_INFO_URL,
                headers={"Authorization": f"Bearer {google_token}"},
            )
            info_resp.raise_for_status()
            google_user = info_resp.json()
    except Exception:
        return RedirectResponse(f"{login_url}?error=google_failed")

    email: str = google_user.get("email", "")
    if not email:
        return RedirectResponse(f"{login_url}?error=google_failed")

    full_name: str = google_user.get("name") or email.split("@")[0]

    # Find or create the local user account.
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            # Google has already verified the email; store an unusable password.
            hashed_password=get_password_hash(secrets.token_hex(32)),
            role=UserRole.standard,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        # Activate a previously-registered-but-unverified account.
        user.is_active = True
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token(data={"sub": user.email})

    # Hand the JWT to the frontend via a query param.  The callback page reads
    # it immediately and replaces the URL so it never sits in browser history.
    callback_url = (
        f"{settings.FRONTEND_URL}/auth/callback"
        f"?token={jwt_token}&next={quote_plus(next_url)}"
    )
    return RedirectResponse(callback_url)
