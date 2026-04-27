from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    subject: str | None = None  # e.g. "Mathematics", "Physics" — sharpens AI context


class ChatResponse(BaseModel):
    response: str
    model: str
