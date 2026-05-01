from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROQ_API_KEY: str
    GROQ_API_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    RESEND_API_KEY: str = ""
    ADMIN_EMAIL: str = "aspireslearninghub@gmail.com"
    CONTACT_EMAIL: str = "contact@aspirelearninghub.com.pk"

    LOG_LEVEL: str = "INFO"

    # Comma-separated list of allowed CORS origins.
    # Example: https://www.aspirelearninghub.com.pk,https://aspirelearninghub.com.pk
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://www.aspirelearninghub.com.pk",
        "https://aspirelearninghub.com.pk",
        "https://aspire-learning-hub.onrender.com",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    FRONTEND_URL: str = "https://www.aspirelearninghub.com.pk"
    BACKEND_URL: str = "https://aspire-learning-hub.onrender.com"
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""


settings = Settings()
