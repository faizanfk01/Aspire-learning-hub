from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.schemas._validators import clean, clean_optional


class ChatHistoryItem(BaseModel):
    """A single prior turn in the conversation, replayed from the client's
    sessionStorage so the model sees the full conversation. Never persisted."""

    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str      = Field(..., min_length=1, max_length=4000)
    subject: str | None = Field(default=None,   max_length=100)
    # Full prior conversation, rebuilt client-side from sessionStorage each call.
    # Capped to keep the prompt (and token cost) bounded.
    history: list[ChatHistoryItem] = Field(default_factory=list, max_length=100)

    @model_validator(mode="before")
    @classmethod
    def strip_and_clean(cls, values: dict) -> dict:
        return {
            k: (clean(v) if k == "message" else clean_optional(v))
               if isinstance(v, str) else v
            for k, v in values.items()
        }


class ChatResponse(BaseModel):
    response: str
    model: str
