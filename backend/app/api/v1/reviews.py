import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.core.limiter import limiter
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead
from app.services.email_service import send_review_confirmation, send_review_notification

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=list[ReviewRead])
@limiter.limit("60/minute")
def list_reviews(request: Request, db: Session = Depends(get_db)):
    """Public: return all approved reviews, newest first."""
    return (
        db.query(Review)
        .filter(Review.is_approved.is_(True))
        .order_by(Review.created_at.desc())
        .limit(50)
        .all()
    )


@router.post("/", response_model=ReviewRead, status_code=201)
@limiter.limit("5/hour")
def submit_review(
    request: Request,
    review_in: ReviewCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Public: submit a review. Stored as pending until admin approves."""
    reviewer_email = review_in.reviewer_email
    review = Review(**review_in.model_dump(exclude={"reviewer_email"}))
    db.add(review)
    db.commit()
    db.refresh(review)
    logger.info(
        "[review] New submission id=%s | %s (%s) | rating=%s",
        review.id, review.name, review.role, review.rating,
    )

    background_tasks.add_task(
        send_review_notification,
        name=review.name,
        role=review.role,
        program=review.program,
        rating=review.rating,
        review_text=review.review_text,
    )

    if reviewer_email:
        background_tasks.add_task(
            send_review_confirmation,
            to_email=str(reviewer_email),
            name=review.name,
        )

    return review


@router.patch("/{review_id}/approve", response_model=ReviewRead)
def approve_review(
    review_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: approve a pending review so it appears publicly."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = True
    db.commit()
    db.refresh(review)
    logger.info("[review] Approved id=%s by admin", review.id)
    return review


@router.patch("/{review_id}/decline", response_model=ReviewRead)
def decline_review(
    review_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: decline a review — kept in history but hidden from public."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_declined = True
    review.is_approved = False
    db.commit()
    db.refresh(review)
    logger.info("[review] Declined id=%s by admin", review.id)
    return review


@router.delete("/declined", status_code=204)
def clear_declined_reviews(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: permanently delete all declined reviews."""
    db.query(Review).filter(Review.is_declined.is_(True)).delete()
    db.commit()
    logger.info("[review] Cleared all declined reviews")


@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: permanently delete a review."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
