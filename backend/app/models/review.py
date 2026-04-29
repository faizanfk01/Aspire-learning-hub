from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20))          # "student" | "parent"
    program: Mapped[str] = mapped_column(String(100))
    rating: Mapped[int] = mapped_column(Integer)           # 1–5
    review_text: Mapped[str] = mapped_column(Text)
    is_approved: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    is_declined: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
