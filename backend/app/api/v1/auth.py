import base64
import json
import logging
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import quote_plus, urlencode

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.core.limiter import limiter
from app.core.login_guard import WINDOW_MINUTES, clear_failures, is_locked_out, record_failure
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.user_otp import UserOTP
from app.schemas.user import OTPVerify, Token, UserCreate, UserRead
from app.services import email_service
from app.services.otp_service import generate_code

_sec = logging.getLogger("aspire.security")

_GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_INFO_URL  = "https://www.googleapis.com/oauth2/v3/userinfo"

router = APIRouter()

_OTP_TTL_MINUTES  = 10
_MAX_OTP_ATTEMPTS = 5


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _ip(request: Request) -> str:
    xff = request.headers.get("X-Forwarded-For", "")
    return xff.split(",")[0].strip() if xff else (
        request.client.host if request.client else "unknown"
    )


@router.post("/signup", status_code=202)
@limiter.limit("5/minute")
def signup(
    request: Request,
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ip = _ip(request)
    existing = db.query(User).filter(User.email == user_in.email).first()

    if existing:
        if existing.is_active:
            _sec.warning("signup_rejected email=%s ip=%s reason=already_active", user_in.email, ip)
            raise HTTPException(status_code=400, detail="Email already registered")
        existing.full_name = user_in.full_name
        existing.hashed_password = get_password_hash(user_in.password)
        user = existing
        _sec.info("signup_otp_resent email=%s ip=%s", user_in.email, ip)
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
        _sec.info("signup_initiated email=%s ip=%s", user_in.email, ip)

    otp_code = generate_code()
    expires  = _utcnow() + timedelta(minutes=_OTP_TTL_MINUTES)

    otp_record = db.query(UserOTP).filter(UserOTP.user_id == user.id).first()
    if otp_record:
        otp_record.code       = otp_code
        otp_record.expires_at = expires
        otp_record.attempts   = 0
    else:
        db.add(UserOTP(user_id=user.id, code=otp_code, expires_at=expires, attempts=0))

    db.commit()

    background_tasks.add_task(
        email_service.send_otp_email,
        user_in.email,
        user_in.full_name,
        otp_code,
    )

    return {"message": "OTP sent to your email."}


@router.post("/verify-otp", response_model=Token)
@limiter.limit("10/minute")
def verify_otp_and_activate(
    request: Request,
    data: OTPVerify,
    db: Session = Depends(get_db),
):
    ip = _ip(request)

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        _sec.warning("otp_failed email=%s ip=%s reason=no_pending_registration", data.email, ip)
        raise HTTPException(
            status_code=400,
            detail="No pending registration for this email. Please sign up first.",
        )
    if user.is_active:
        raise HTTPException(status_code=400, detail="Account already verified. Please log in.")

    otp_record = db.query(UserOTP).filter(UserOTP.user_id == user.id).first()
    if not otp_record:
        _sec.warning("otp_failed email=%s ip=%s reason=no_otp_record", data.email, ip)
        raise HTTPException(
            status_code=400,
            detail="No verification code found. Please sign up again.",
        )

    if otp_record.attempts >= _MAX_OTP_ATTEMPTS:
        db.delete(otp_record)
        db.commit()
        _sec.warning("otp_locked email=%s ip=%s reason=max_attempts", data.email, ip)
        raise HTTPException(
            status_code=429,
            detail="Too many incorrect attempts. Please sign up again to receive a new code.",
        )

    expires = otp_record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if _utcnow() > expires:
        db.delete(otp_record)
        db.commit()
        _sec.warning("otp_failed email=%s ip=%s reason=expired", data.email, ip)
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please sign up again.",
        )

    if not secrets.compare_digest(otp_record.code, data.otp_code):
        otp_record.attempts += 1
        db.commit()
        remaining = _MAX_OTP_ATTEMPTS - otp_record.attempts
        _sec.warning(
            "otp_failed email=%s ip=%s reason=wrong_code attempts_left=%d",
            data.email, ip, remaining,
        )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining.",
        )

    user.is_active = True
    db.delete(otp_record)
    db.commit()
    db.refresh(user)

    _sec.info("otp_verified email=%s ip=%s", data.email, ip)
    return {"access_token": create_access_token(data={"sub": user.email}), "token_type": "bearer"}


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = form_data.username.strip().lower()
    ip    = _ip(request)

    if is_locked_out(email):
        _sec.warning("login_blocked email=%s ip=%s reason=lockout", email, ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {WINDOW_MINUTES} minutes.",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        record_failure(email)
        _sec.warning("login_failed email=%s ip=%s reason=bad_credentials", email, ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        _sec.warning("login_rejected email=%s ip=%s reason=unverified", email, ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox for the verification code.",
        )

    clear_failures(email)
    _sec.info("login_ok email=%s ip=%s", email, ip)
    return {"access_token": create_access_token(data={"sub": user.email}), "token_type": "bearer"}


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


# ── Forgot Password ───────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str


@router.post("/forgot-password", status_code=202)
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ip = _ip(request)
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
        _sec.info("password_reset_sent email=%s ip=%s", data.email, ip)
    else:
        # Log at debug — we don't log the email as WARNING to avoid filling
        # logs when someone enters a mistyped address.
        _sec.debug("password_reset_no_account email=%s ip=%s", data.email, ip)

    # Always return the same response to avoid leaking whether an email exists.
    return {"message": "If that email is registered, a reset link has been sent."}


# ── Reset Password ────────────────────────────────────────────────────────────

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    ip = _ip(request)

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    try:
        payload = jwt.decode(
            data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("purpose") != "password_reset":
            _sec.warning("reset_invalid_token ip=%s reason=wrong_purpose", ip)
            raise HTTPException(status_code=400, detail="Invalid reset token.")
        email: str | None = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid reset token.")
    except JWTError:
        _sec.warning("reset_invalid_token ip=%s reason=jwt_error", ip)
        raise HTTPException(status_code=400, detail="Reset link has expired or is invalid.")

    user = db.query(User).filter(
        User.email == email,
        User.is_active == True,  # noqa: E712
    ).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token.")

    user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    _sec.info("password_reset_ok email=%s ip=%s", email, ip)
    return {"message": "Password reset successfully. You can now log in."}


# ── Google OAuth ──────────────────────────────────────────────────────────────

def _google_redirect_uri() -> str:
    return f"{settings.BACKEND_URL}/api/v1/auth/google/callback"


@router.get("/google/login")
@limiter.limit("10/minute")
def google_login(request: Request, next: str = "/"):
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
@limiter.limit("10/minute")
def google_callback(
    request: Request,
    code: str = "",
    state: str = "",
    error: str = "",
    db: Session = Depends(get_db),
):
    """Google redirects here after the user grants (or denies) consent."""
    ip        = _ip(request)
    login_url = f"{settings.FRONTEND_URL}/login"

    if error or not code:
        _sec.warning("oauth_denied ip=%s error=%r", ip, error)
        return RedirectResponse(f"{login_url}?error=google_denied")

    next_url = "/"
    try:
        padded    = state + "=" * (-len(state) % 4)
        state_data = json.loads(base64.urlsafe_b64decode(padded).decode())
        raw_next   = state_data.get("next", "/")
        next_url   = raw_next if isinstance(raw_next, str) and raw_next.startswith("/") else "/"
    except Exception:
        pass

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
    except Exception as exc:
        _sec.error("oauth_token_exchange_failed ip=%s error=%s", ip, exc)
        return RedirectResponse(f"{login_url}?error=google_failed")

    email: str = google_user.get("email", "")
    if not email:
        _sec.warning("oauth_no_email ip=%s", ip)
        return RedirectResponse(f"{login_url}?error=google_failed")

    full_name: str = google_user.get("name") or email.split("@")[0]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=get_password_hash(secrets.token_hex(32)),
            role=UserRole.standard,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        _sec.info("oauth_signup email=%s ip=%s", email, ip)
    elif not user.is_active:
        user.is_active = True
        db.commit()
        db.refresh(user)
        _sec.info("oauth_activated email=%s ip=%s", email, ip)
    else:
        _sec.info("oauth_login email=%s ip=%s", email, ip)

    jwt_token = create_access_token(data={"sub": user.email})
    callback_url = (
        f"{settings.FRONTEND_URL}/auth/callback"
        f"?token={jwt_token}&next={quote_plus(next_url)}"
    )
    return RedirectResponse(callback_url)
