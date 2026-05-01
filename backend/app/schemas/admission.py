from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.admission import AdmissionStatus
from app.schemas._validators import clean


class AdmissionCreate(BaseModel):
    student_name:      str = Field(..., min_length=2,  max_length=100)
    father_name:       str = Field(..., min_length=2,  max_length=100)
    grade:             str = Field(..., min_length=1,  max_length=30)
    contact_number:    str = Field(..., min_length=7,  max_length=25)
    address:           str = Field(default="",         max_length=300)
    guardian_cnic:     str = Field(default="",         max_length=20)
    school_name:       str = Field(default="",         max_length=150)
    age:               str = Field(default="",         max_length=10)
    gender:            str = Field(default="",         max_length=15)
    tuition_type:      str = Field(default="",         max_length=50)
    specific_subjects: str = Field(default="",         max_length=500)
    struggling_with:   str = Field(default="",         max_length=1000)

    @model_validator(mode="before")
    @classmethod
    def strip_and_clean(cls, values: dict) -> dict:
        return {
            k: clean(v) if isinstance(v, str) else v
            for k, v in values.items()
        }

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        if v and v not in ("male", "female", "other", ""):
            raise ValueError("gender must be 'male', 'female', or 'other'")
        return v

    @field_validator("tuition_type")
    @classmethod
    def validate_tuition_type(cls, v: str) -> str:
        allowed = {"full", "specific_subjects", ""}
        if v and v not in allowed:
            raise ValueError("tuition_type must be 'full' or 'specific_subjects'")
        return v


class AdmissionRead(BaseModel):
    id:                int
    user_id:           int
    student_name:      str
    father_name:       str
    grade:             str
    contact_number:    str
    address:           str
    guardian_cnic:     str | None
    school_name:       str | None
    age:               str | None
    gender:            str | None
    tuition_type:      str | None
    specific_subjects: str | None
    struggling_with:   str | None
    status:            AdmissionStatus
    created_at:        datetime

    model_config = {"from_attributes": True}


class AdmissionStatusUpdate(BaseModel):
    status: AdmissionStatus
