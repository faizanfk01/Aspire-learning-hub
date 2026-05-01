from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas._validators import clean


class ReviewCreate(BaseModel):
    name:        str = Field(..., min_length=2,  max_length=100)
    role:        str = Field(..., description="'student' or 'parent'")
    program:     str = Field(..., min_length=2,  max_length=100)
    rating:      int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=20, max_length=1500)

    @model_validator(mode="before")
    @classmethod
    def strip_and_clean(cls, values: dict) -> dict:
        return {
            k: clean(v) if isinstance(v, str) else v
            for k, v in values.items()
        }

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
    is_approved: bool
    is_declined: bool
    created_at: datetime

    model_config = {"from_attributes": True}
