from pydantic import BaseModel, Field


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email_or_phone: str = Field(..., min_length=3, max_length=150)
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)
    # Populated by the frontend when the user is logged in and provided a phone
    # number instead of an email address, so the auto-reply still reaches them.
    user_account_email: str | None = None


class ContactRead(BaseModel):
    id: int
    name: str
    email_or_phone: str
    subject: str
    message: str

    model_config = {"from_attributes": True}
