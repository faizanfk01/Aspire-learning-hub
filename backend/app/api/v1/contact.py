import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.limiter import limiter
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate, ContactRead
from app.services import email_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=ContactRead, status_code=201)
@limiter.limit("3/hour")
def submit_contact(
    request: Request,
    contact_in: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Public: persist a contact form submission and notify admin."""
    msg = ContactMessage(
        name=contact_in.name,
        email_or_phone=contact_in.email_or_phone,
        subject=contact_in.subject,
        message=contact_in.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    logger.info(
        "[contact] Saved id=%s | from: %s (%s) | subject: %s",
        msg.id, msg.name, msg.email_or_phone, msg.subject,
    )

    background_tasks.add_task(
        email_service.send_contact_notification,
        msg.name,
        msg.email_or_phone,
        msg.subject,
        msg.message,
    )

    # Auto-reply only when the submitter provided a verified email address.
    # Phone-number-only submissions do not receive an auto-reply to prevent
    # delivering email to an unverified, client-supplied address.
    if "@" in msg.email_or_phone:
        background_tasks.add_task(
            email_service.send_contact_auto_reply,
            msg.name,
            msg.email_or_phone,
        )
    else:
        logger.info("[contact] No email in email_or_phone — skipping auto-reply")

    return msg
