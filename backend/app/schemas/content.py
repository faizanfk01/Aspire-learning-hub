from pydantic import BaseModel, Field, model_validator

from app.schemas._validators import clean


class ContentCreate(BaseModel):
    title:        str      = Field(..., min_length=2,  max_length=200)
    description:  str | None = Field(default=None,    max_length=1000)
    content_type: str      = Field(..., min_length=1,  max_length=50)
    file_source:  str      = Field(..., min_length=5,  max_length=500)
    target_grade: str      = Field(..., min_length=1,  max_length=30)

    @model_validator(mode="before")
    @classmethod
    def strip_and_clean(cls, values: dict) -> dict:
        return {
            k: clean(v) if isinstance(v, str) else v
            for k, v in values.items()
        }


class ContentRead(BaseModel):
    id: int
    title: str
    description: str | None
    content_type: str
    file_source: str
    target_grade: str

    model_config = {"from_attributes": True}
