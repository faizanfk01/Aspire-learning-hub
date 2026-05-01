import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.core.limiter import limiter
from app.models.conversation_summary import ConversationSummary
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.groq_service import ask_groq, ask_groq_stream, generate_session_summary

router = APIRouter()


def _fetch_summary(db: Session, user_id: int) -> str:
    record = (
        db.query(ConversationSummary)
        .filter(ConversationSummary.user_id == user_id)
        .first()
    )
    return record.summary if record else ""


def _store_summary(db: Session, user_id: int, summary: str) -> None:
    record = (
        db.query(ConversationSummary)
        .filter(ConversationSummary.user_id == user_id)
        .first()
    )
    if record:
        record.summary = summary
    else:
        db.add(ConversationSummary(user_id=user_id, summary=summary))
    db.commit()


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    student_context = _fetch_summary(db, current_user.id)

    try:
        result = await ask_groq(body.message, body.subject, student_context)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"AI service misconfigured: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    try:
        new_summary = await generate_session_summary(body.message, result["response"])
        _store_summary(db, current_user.id, new_summary)
    except Exception:
        pass

    return result


@router.post("/chat/stream")
@limiter.limit("10/minute")
async def chat_stream(
    request: Request,
    body: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    student_context = _fetch_summary(db, current_user.id)

    async def generate():
        tokens: list[str] = []
        try:
            async for token in ask_groq_stream(
                body.message, body.subject, student_context
            ):
                tokens.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
        except RuntimeError as exc:
            yield f"data: {json.dumps({'error': f'AI service misconfigured: {exc}'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': f'AI service error: {exc}'})}\n\n"
        yield "data: [DONE]\n\n"

        try:
            full_response = "".join(tokens)
            new_summary = await generate_session_summary(body.message, full_response)
            _store_summary(db, current_user.id, new_summary)
        except Exception:
            pass

    return StreamingResponse(generate(), media_type="text/event-stream")
