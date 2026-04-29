from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db, require_admin
from app.models.admission import Admission, AdmissionStatus
from app.models.user import User, UserRole
from app.schemas.admission import AdmissionCreate, AdmissionRead, AdmissionStatusUpdate
from app.services import email_service

router = APIRouter()


@router.get("/", response_model=list[AdmissionRead])
def list_admissions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: list all admissions with pagination."""
    return db.query(Admission).offset(skip).limit(limit).all()


@router.get("/pending", response_model=list[AdmissionRead])
def list_pending_admissions(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: list all pending admission applications."""
    return (
        db.query(Admission)
        .filter(Admission.status == AdmissionStatus.pending)
        .all()
    )


@router.get("/mine", response_model=list[AdmissionRead])
def my_admissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Authenticated user: view their own admission records."""
    return db.query(Admission).filter(Admission.user_id == current_user.id).all()


@router.get("/{admission_id}", response_model=AdmissionRead)
def get_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Authenticated user: own record. Admin: any record."""
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    if current_user.role != UserRole.admin and admission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to view this record")
    return admission


@router.post("/", response_model=AdmissionRead, status_code=201)
async def create_admission(
    admission_in: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    admission = Admission(user_id=current_user.id, **admission_in.model_dump())
    db.add(admission)
    db.commit()
    db.refresh(admission)

    await email_service.send_admission_notification(
        student_name=admission_in.student_name,
        father_name=admission_in.father_name,
        grade=admission_in.grade,
        contact_number=admission_in.contact_number,
        address=admission_in.address,
    )
    return admission


@router.patch("/{admission_id}", response_model=AdmissionRead)
def update_admission_status(
    admission_id: int,
    update: AdmissionStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: update the status of an admission and sync is_admitted on the user."""
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    admission.status = update.status

    # Keep user.is_admitted in sync with approval status
    student = db.get(User, admission.user_id)
    if student:
        student.is_admitted = update.status == AdmissionStatus.approved

    db.commit()
    db.refresh(admission)
    return admission


@router.post("/approve/{user_id}", response_model=dict)
def approve_student(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: directly grant admission access to a user by ID."""
    student = db.get(User, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")

    student.is_admitted = True

    # Also approve their most recent pending admission, if any
    pending = (
        db.query(Admission)
        .filter(
            Admission.user_id == user_id,
            Admission.status == AdmissionStatus.pending,
        )
        .order_by(Admission.created_at.desc())
        .first()
    )
    if pending:
        pending.status = AdmissionStatus.approved

    db.commit()
    return {"message": f"User {user_id} admitted successfully.", "is_admitted": True}
