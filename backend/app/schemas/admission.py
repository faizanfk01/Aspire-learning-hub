from datetime import datetime

from pydantic import BaseModel

from app.models.admission import AdmissionStatus


class AdmissionCreate(BaseModel):
    student_name: str
    father_name: str
    grade: str
    contact_number: str
    address: str


class AdmissionRead(BaseModel):
    id: int
    user_id: int
    student_name: str
    father_name: str
    grade: str
    contact_number: str
    address: str
    status: AdmissionStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class AdmissionStatusUpdate(BaseModel):
    status: AdmissionStatus
