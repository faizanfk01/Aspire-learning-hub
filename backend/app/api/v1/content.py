from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db, require_admin
from app.models.content import Content
from app.models.user import User
from app.schemas.content import ContentCreate, ContentRead

router = APIRouter()


@router.get("/", response_model=list[ContentRead])
def list_content(
    grade: str | None = None,
    content_type: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """Authenticated: list materials, filterable by grade or type."""
    query = db.query(Content)
    if grade:
        query = query.filter(Content.target_grade == grade)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    return query.offset(skip).limit(limit).all()


@router.get("/{content_id}", response_model=ContentRead)
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """Authenticated: fetch a single content item."""
    content = db.get(Content, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


@router.post("/", response_model=ContentRead, status_code=201)
def create_content(
    content_in: ContentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    content = Content(**content_in.model_dump())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.put("/{content_id}", response_model=ContentRead)
def update_content(
    content_id: int,
    content_in: ContentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    content = db.get(Content, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    for field, value in content_in.model_dump().items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=204)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    content = db.get(Content, content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    db.delete(content)
    db.commit()
