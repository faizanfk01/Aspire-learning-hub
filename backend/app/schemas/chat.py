from pydantic import BaseModel, Field, model_validator

from app.schemas._validators import clean, clean_optional


class ChatRequest(BaseModel):
    message: str      = Field(..., min_length=1, max_length=4000)
    subject: str | None = Field(default=None,   max_length=100)

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
