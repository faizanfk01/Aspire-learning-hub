from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole
from app.schemas._validators import clean


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email:     EmailStr
    password:  str

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_name(cls, v: str) -> str:
        return clean(v)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserRead(BaseModel):
    id:          int
    full_name:   str
    email:       EmailStr
    role:        UserRole
    is_active:   bool
    is_admitted: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"


class OTPVerify(BaseModel):
    email:    EmailStr
    otp_code: str

    @field_validator("otp_code")
    @classmethod
    def otp_format(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be exactly 6 digits")
        return v
