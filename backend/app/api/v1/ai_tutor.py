import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.groq_service import ask_groq, ask_groq_stream

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    _: User = Depends(get_current_active_user),
):
    """Send a question to the Groq AI tutor and receive a full response."""
    try:
        return await ask_groq(request.message, request.subject)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    _: User = Depends(get_current_active_user),
):
    """Stream the Groq AI tutor's response token-by-token via Server-Sent Events.

    Clients should consume the `data:` lines from the SSE stream.
    The final event is `data: [DONE]`.
    """

    async def generate():
        try:
            async for token in ask_groq_stream(request.message, request.subject):
                payload = json.dumps({"token": token})
                yield f"data: {payload}\n\n"
        except Exception as exc:
            error = json.dumps({"error": str(exc)})
            yield f"data: {error}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
