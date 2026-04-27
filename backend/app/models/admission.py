import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AdmissionStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Admission(Base):
    __tablename__ = "admissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    father_name: Mapped[str] = mapped_column(String(100))
    grade: Mapped[str] = mapped_column(String(20))
    contact_number: Mapped[str] = mapped_column(String(20))
    address: Mapped[str] = mapped_column(String(255))
    status: Mapped[AdmissionStatus] = mapped_column(
        SAEnum(AdmissionStatus), default=AdmissionStatus.pending
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    student: Mapped["User"] = relationship("User", back_populates="admissions")
