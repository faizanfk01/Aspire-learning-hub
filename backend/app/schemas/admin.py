from datetime import datetime

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_admissions: int
    pending_admissions: int
    active_students: int
    total_content: int
    pending_reviews: int


class AdminAdmission(BaseModel):
    id: int
    student_name: str
    father_name: str
    grade: str
    contact_number: str
    address: str | None = None
    age: str | None = None
    gender: str | None = None
    guardian_cnic: str | None = None
    school_name: str | None = None
    tuition_type: str | None = None
    specific_subjects: str | None = None
    struggling_with: str | None = None
    status: str
    created_at: datetime
    user_id: int | None = None
    user_email: str | None = None
    user_name: str | None = None


class AdminStudent(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    is_admitted: bool

    model_config = {"from_attributes": True}
