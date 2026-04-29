from datetime import datetime

from pydantic import BaseModel

from app.models.admission import AdmissionStatus


class AdmissionCreate(BaseModel):
    student_name: str
    father_name: str
    grade: str
    contact_number: str
    address: str = ""
    guardian_cnic: str = ""
    school_name: str = ""
    age: str = ""
    gender: str = ""
    tuition_type: str = ""
    specific_subjects: str = ""
    struggling_with: str = ""


class AdmissionRead(BaseModel):
    id: int
    user_id: int
    student_name: str
    father_name: str
    grade: str
    contact_number: str
    address: str
    guardian_cnic: str | None
    school_name: str | None
    age: str | None
    gender: str | None
    tuition_type: str | None
    specific_subjects: str | None
    struggling_with: str | None
    status: AdmissionStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class AdmissionStatusUpdate(BaseModel):
    status: AdmissionStatus
