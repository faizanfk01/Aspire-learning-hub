import enum
from typing import Optional

from sqlalchemy import Boolean, Enum as SAEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    standard = "standard"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.standard)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    admissions: Mapped[list["Admission"]] = relationship(
        "Admission", back_populates="student"
    )
    otp: Mapped[Optional["UserOTP"]] = relationship(
        "UserOTP",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
