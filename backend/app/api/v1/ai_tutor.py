import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
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
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    student_context = _fetch_summary(db, current_user.id)

    try:
        result = await ask_groq(request.message, request.subject, student_context)
    except RuntimeError as exc:
        # Config-level failure (missing key, etc.) — expose clearly
        raise HTTPException(status_code=503, detail=f"AI service misconfigured: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    # Best-effort: update the persistent memory summary after every exchange.
    try:
        new_summary = await generate_session_summary(request.message, result["response"])
        _store_summary(db, current_user.id, new_summary)
    except Exception:
        pass

    return result


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    student_context = _fetch_summary(db, current_user.id)

    async def generate():
        tokens: list[str] = []
        try:
            async for token in ask_groq_stream(
                request.message, request.subject, student_context
            ):
                tokens.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
        except RuntimeError as exc:
            yield f"data: {json.dumps({'error': f'AI service misconfigured: {exc}'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': f'AI service error: {exc}'})}\n\n"
        yield "data: [DONE]\n\n"

        # Best-effort summary update after the full response has been streamed.
        try:
            full_response = "".join(tokens)
            new_summary = await generate_session_summary(request.message, full_response)
            _store_summary(db, current_user.id, new_summary)
        except Exception:
            pass

    return StreamingResponse(generate(), media_type="text/event-stream")
