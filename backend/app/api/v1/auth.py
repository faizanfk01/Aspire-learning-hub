from datetime import datetime, timedelta, timezone

import resend
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.user_otp import UserOTP
from app.schemas.user import OTPVerify, Token, UserCreate, UserRead
from app.services.otp_service import generate_code

router = APIRouter()

_OTP_TTL_MINUTES = 10


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _send_otp_email(to_email: str, full_name: str, otp_code: str) -> None:
    """
    Call Resend synchronously and raise on any failure so the caller can
    surface a meaningful error instead of silently swallowing it.

    IMPORTANT — Resend sandbox restriction:
      When using "onboarding@resend.dev" as the sender, Resend will ONLY
      deliver to the email address registered on your Resend account.
      Any other recipient gets a 422 ValidationError from the Resend API.
      To send to arbitrary addresses you must verify a custom domain at
      https://resend.com/domains and change the "from" address below.
    """
    print(f"DEBUG: Attempting to send OTP {otp_code} to {to_email}")
    print(f"DEBUG: Using RESEND_API_KEY = {settings.RESEND_API_KEY[:12]}...")

    resend.api_key = settings.RESEND_API_KEY

    result = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to":   [to_email],
        "subject": "Your Aspire Learning Hub verification code",
        "html": _otp_html(full_name, otp_code),
    })

    print(f"DEBUG: Resend response → {result}")


def _otp_html(full_name: str, code: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1d4ed8;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">Aspire Learning Hub</h1>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;
                  border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#374151;margin-top:0;">Hi <strong>{full_name}</strong>,</p>
        <p style="color:#374151;">
          Use the verification code below to activate your account.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#eff6ff;border:2px solid #1d4ed8;border-radius:12px;
                    text-align:center;padding:28px;margin:28px 0;">
          <span style="font-size:44px;font-weight:bold;letter-spacing:12px;
                       color:#1d4ed8;font-family:monospace;">
            {code}
          </span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
          If you did not create an account at Aspire Learning Hub, ignore this email.
        </p>
      </div>
    </div>
    """


# ── Diagnostic — hit this first to confirm Resend is wired up ────────────────

@router.get("/test-email")
def test_email():
    """
    GET /api/v1/auth/test-email
    Sends a real email to the Resend account owner's address to verify the
    API key and network connectivity.  Remove this route before going live.
    """
    try:
        resend.api_key = settings.RESEND_API_KEY
        result = resend.Emails.send({
            "from":    "onboarding@resend.dev",
            "to":      ["delivered@resend.dev"],   # Resend's always-delivers test address
            "subject": "Aspire — Resend connectivity test",
            "html":    "<p>Resend is working correctly.</p>",
        })
        return {"status": "ok", "resend_response": result}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


# ── Signup — creates inactive user + sends OTP ───────────────────────────────

@router.post("/signup", status_code=202)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Step 1 of email-verified signup:
      1. Create (or refresh) an inactive user.
      2. Generate a 6-digit OTP, persist it in user_otps with a 10-min TTL.
      3. Send via Resend — if Resend rejects the request, the error is returned
         to the caller rather than being swallowed.
    """
    existing = db.query(User).filter(User.email == user_in.email).first()

    if existing:
        if existing.is_active:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Previous incomplete signup — refresh credentials and re-issue OTP
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
        db.flush()  # write INSERT so user.id is available

    # Upsert OTP record
    otp_code = generate_code()
    expires  = _utcnow() + timedelta(minutes=_OTP_TTL_MINUTES)

    otp_record = db.query(UserOTP).filter(UserOTP.user_id == user.id).first()
    if otp_record:
        otp_record.code       = otp_code
        otp_record.expires_at = expires
    else:
        db.add(UserOTP(user_id=user.id, code=otp_code, expires_at=expires))

    db.commit()

    # Send OTP — raise on failure so the frontend shows the real error
    try:
        _send_otp_email(user_in.email, user_in.full_name, otp_code)
    except Exception as exc:
        print(f"RESEND ERROR: {exc}")
        raise HTTPException(
            status_code=502,
            detail=(
                f"Account created but email could not be sent: {exc}. "
                "If you see '422 Unprocessable Entity', Resend's sandbox only delivers "
                "to your Resend account's registered email address. Verify a domain at "
                "https://resend.com/domains to send to any address."
            ),
        )

    return {"message": "OTP sent to your email."}


# ── Verify OTP — activate user + return JWT ───────────────────────────────────

@router.post("/verify-otp", response_model=Token)
def verify_otp_and_activate(data: OTPVerify, db: Session = Depends(get_db)):
    """
    Step 2: validate otp_code, set is_active=True, delete OTP row, return JWT.
    """
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

    # Normalise timezone — PostgreSQL returns timezone-aware datetimes with psycopg2
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

    print(f"DEBUG: {user.email} verified and activated.")
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
