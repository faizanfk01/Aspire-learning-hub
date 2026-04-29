from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
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
