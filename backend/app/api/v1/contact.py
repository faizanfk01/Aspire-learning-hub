import logging

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate, ContactRead
from app.services import email_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=ContactRead, status_code=201)
def submit_contact(
    contact_in: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Public: persist a contact form submission, notify admin, and auto-reply to sender."""
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

    # 1. Notify admin inbox
    background_tasks.add_task(
        email_service.send_contact_notification,
        msg.name,
        msg.email_or_phone,
        msg.subject,
        msg.message,
    )

    # 2. Auto-reply to the sender.
    #    Use email_or_phone if it looks like an email; otherwise fall back to the
    #    account email the frontend passed (populated when user is logged in).
    if "@" in msg.email_or_phone:
        reply_to = msg.email_or_phone
    elif contact_in.user_account_email and "@" in contact_in.user_account_email:
        reply_to = contact_in.user_account_email
        logger.info("[contact] Phone-only submission — auto-reply going to account email")
    else:
        reply_to = None
        logger.info("[contact] No email address available — skipping auto-reply")

    if reply_to:
        background_tasks.add_task(
            email_service.send_contact_auto_reply,
            msg.name,
            reply_to,
        )

    return msg
