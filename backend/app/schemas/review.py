from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ReviewCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(..., description="'student' or 'parent'")
    program: str = Field(..., min_length=2, max_length=100)
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=20, max_length=1500)
    reviewer_email: str | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("student", "parent"):
            raise ValueError("role must be 'student' or 'parent'")
        return v


class ReviewRead(BaseModel):
    id: int
    name: str
    role: str
    program: str
    rating: int
    review_text: str
    created_at: datetime

    model_config = {"from_attributes": True}
