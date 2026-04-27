from pydantic import BaseModel


class ContentCreate(BaseModel):
    title: str
    description: str | None = None
    content_type: str
    file_source: str
    target_grade: str


class ContentRead(BaseModel):
    id: int
    title: str
    description: str | None
    content_type: str
    file_source: str
    target_grade: str

    model_config = {"from_attributes": True}
