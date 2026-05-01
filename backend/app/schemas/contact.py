from pydantic import BaseModel, Field, model_validator

from app.schemas._validators import clean


class ContactCreate(BaseModel):
    name:           str = Field(..., min_length=2,  max_length=100)
    email_or_phone: str = Field(..., min_length=3,  max_length=150)
    subject:        str = Field(..., min_length=3,  max_length=200)
    message:        str = Field(..., min_length=10, max_length=2000)

    @model_validator(mode="before")
    @classmethod
    def strip_and_clean(cls, values: dict) -> dict:
        return {
            k: clean(v) if isinstance(v, str) else v
            for k, v in values.items()
        }


class ContactRead(BaseModel):
    id: int
    name: str
    email_or_phone: str
    subject: str
    message: str

    model_config = {"from_attributes": True}
