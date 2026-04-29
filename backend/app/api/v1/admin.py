import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, require_admin
from app.models.admission import Admission, AdmissionStatus
from app.models.content import Content
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.admin import AdminAdmission, AdminStudent, DashboardStats
from app.schemas.review import ReviewRead
from app.services import email_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return DashboardStats(
        total_admissions=db.query(Admission).count(),
        pending_admissions=db.query(Admission)
            .filter(Admission.status == AdmissionStatus.pending)
            .count(),
        active_students=db.query(User)
            .filter(User.role == UserRole.standard, User.is_admitted.is_(True))
            .count(),
        total_content=db.query(Content).count(),
        pending_reviews=db.query(Review).filter(
            Review.is_approved.is_(False), Review.is_declined.is_(False)
        ).count(),
    )


@router.get("/admissions", response_model=list[AdminAdmission])
def list_admin_admissions(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Admission).options(joinedload(Admission.student))
    if status and status in ("pending", "approved", "rejected"):
        q = q.filter(Admission.status == AdmissionStatus[status])
    admissions = q.order_by(Admission.created_at.desc()).all()

    return [
        AdminAdmission(
            id=a.id,
            student_name=a.student_name,
            father_name=a.father_name,
            grade=a.grade,
            contact_number=a.contact_number,
            address=a.address or None,
            age=a.age,
            gender=a.gender,
            guardian_cnic=a.guardian_cnic,
            school_name=a.school_name,
            tuition_type=a.tuition_type,
            specific_subjects=a.specific_subjects,
            struggling_with=a.struggling_with,
            status=a.status.value,
            created_at=a.created_at,
            user_id=a.user_id,
            user_email=a.student.email if a.student else None,
            user_name=a.student.full_name if a.student else None,
        )
        for a in admissions
    ]


@router.patch("/admissions/{admission_id}/approve")
def approve_admission(
    admission_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    admission.status = AdmissionStatus.approved
    student = db.get(User, admission.user_id)
    if student:
        student.is_admitted = True
        background_tasks.add_task(
            email_service.send_admission_approved_email,
            student.email,
            student.full_name,
        )

    db.commit()
    logger.info("[admin] Approved admission id=%s", admission_id)
    return {"message": "Admission approved", "id": admission_id}


@router.patch("/admissions/{admission_id}/decline")
def decline_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    admission.status = AdmissionStatus.rejected
    student = db.get(User, admission.user_id)
    if student:
        student.is_admitted = False

    db.commit()
    logger.info("[admin] Declined admission id=%s", admission_id)
    return {"message": "Admission declined", "id": admission_id}


@router.patch("/admissions/{admission_id}/revoke")
def revoke_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    admission.status = AdmissionStatus.rejected
    student = db.get(User, admission.user_id)
    if student:
        student.is_admitted = False

    db.commit()
    logger.info("[admin] Revoked admission id=%s", admission_id)
    return {"message": "Admission revoked", "id": admission_id}


@router.delete("/admissions/clear-declined", status_code=204)
def clear_declined_admissions(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    db.query(Admission).filter(
        Admission.status == AdmissionStatus.rejected
    ).delete()
    db.commit()
    logger.info("[admin] Cleared all declined/rejected admissions")


@router.delete("/admissions/{admission_id}", status_code=204)
def delete_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    db.delete(admission)
    db.commit()


@router.get("/students", response_model=list[AdminStudent])
def list_students(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(User)
        .filter(User.role == UserRole.standard)
        .order_by(User.id.desc())
        .all()
    )


@router.get("/pending-reviews", response_model=list[ReviewRead])
def list_pending_reviews(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(Review)
        .filter(Review.is_approved.is_(False), Review.is_declined.is_(False))
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/declined-reviews", response_model=list[ReviewRead])
def list_declined_reviews(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(Review)
        .filter(Review.is_declined.is_(True))
        .order_by(Review.created_at.desc())
        .all()
    )
