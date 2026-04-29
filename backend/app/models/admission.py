import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text, func
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

    # ── Core fields ───────────────────────────────────────────────────────────
    student_name: Mapped[str] = mapped_column(String(100))
    father_name: Mapped[str] = mapped_column(String(100))        # guardian name
    grade: Mapped[str] = mapped_column(String(20))
    contact_number: Mapped[str] = mapped_column(String(20))
    address: Mapped[str] = mapped_column(String(255), server_default="")

    status: Mapped[AdmissionStatus] = mapped_column(
        SAEnum(AdmissionStatus), default=AdmissionStatus.pending
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Extended fields (migration 002) ───────────────────────────────────────
    guardian_cnic: Mapped[str | None] = mapped_column(String(20), nullable=True)
    school_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    age: Mapped[str | None] = mapped_column(String(10), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    tuition_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    specific_subjects: Mapped[str | None] = mapped_column(String(500), nullable=True)
    struggling_with: Mapped[str | None] = mapped_column(Text, nullable=True)

    student: Mapped["User"] = relationship("User", back_populates="admissions")
