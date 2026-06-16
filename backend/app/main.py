import logging
import os
import secrets
import sys
import time
from contextlib import asynccontextmanager
from datetime import timedelta

try:
    from app.core.logging_config import configure_logging
except ModuleNotFoundError:
    from core.logging_config import configure_logging

configure_logging()

_log = logging.getLogger("aspire.startup")

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir  = os.path.dirname(current_dir)

if current_dir not in sys.path:
    sys.path.append(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

import sqlalchemy.exc
from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqladmin import Admin

try:
    from app.admin import AdmissionAdmin, ContentAdmin, UserAdmin
    from app.api.v1 import admissions, ai_tutor, auth, content, contact, reviews
    from app.api.v1 import admin as admin_api
    from app.core.database import engine
    from app.core.limiter import limiter
    from app.middleware.security import RequestLoggingMiddleware, SecurityHeadersMiddleware
    from app.models import Base
except ModuleNotFoundError:
    from admin import AdmissionAdmin, ContentAdmin, UserAdmin
    from api.v1 import admissions, ai_tutor, auth, content, contact, reviews
    from api.v1 import admin as admin_api
    from core.database import engine
    from core.limiter import limiter
    from middleware.security import RequestLoggingMiddleware, SecurityHeadersMiddleware
    from models import Base


async def _seed_admin() -> None:
    try:
        from app.core.config import settings as _s
        from app.core.database import SessionLocal
        from app.core.security import create_access_token, get_password_hash
        from app.models.user import User, UserRole
        from app.services import email_service
    except ImportError:
        from core.config import settings as _s
        from core.database import SessionLocal
        from core.security import create_access_token, get_password_hash
        from models.user import User, UserRole
        from services import email_service

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == _s.ADMIN_EMAIL).first()

        if existing:
            if existing.role == UserRole.admin:
                return
            existing.role = UserRole.admin
            existing.is_active = True
            existing.is_admitted = True
            db.commit()
            _log.info("admin_upgraded email=%s", _s.ADMIN_EMAIL)
            return

        admin = User(
            full_name="Aspire Admin",
            email=_s.ADMIN_EMAIL,
            hashed_password=get_password_hash(secrets.token_hex(32)),
            role=UserRole.admin,
            is_active=True,
            is_admitted=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        reset_token = create_access_token(
            data={"sub": admin.email, "purpose": "password_reset"},
            expires_delta=timedelta(hours=24),
        )
        reset_link = f"{_s.FRONTEND_URL}/reset-password?token={reset_token}"
        await email_service.send_password_reset_email(admin.email, "Aspire Admin", reset_link)
        _log.info("admin_seeded email=%s reset_link_sent=true", _s.ADMIN_EMAIL)

    except Exception as exc:
        _log.error("admin_seed_failed error=%s", exc, exc_info=True)
        db.rollback()
    finally:
        db.close()


def _run_migrations() -> None:
    Base.metadata.create_all(bind=engine)
    alembic_ini = os.path.join(parent_dir, "alembic.ini")
    if os.path.exists(alembic_ini):
        cfg = AlembicConfig(alembic_ini)
        alembic_command.upgrade(cfg, "head")
        _log.info("migrations_applied revision=head")
    else:
        _log.warning("alembic_ini_missing path=%s — skipping migrations", alembic_ini)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("TESTING"):
        _log.info("startup_mode=testing — skipping DB setup")
    else:
        connected = False
        while not connected:
            try:
                _run_migrations()
                connected = True
            except sqlalchemy.exc.OperationalError:
                _log.warning("db_not_ready — retrying in 2 s")
                time.sleep(2)
        await _seed_admin()
    _log.info("startup_complete")
    yield
    _log.info("shutdown_complete")


app = FastAPI(
    title="Aspire Learning Hub API",
    version="1.0.0",
    description="Backend API for the Aspire Learning Hub academy management system.",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

try:
    from app.core.config import settings as _cors_settings
except ImportError:
    from core.config import settings as _cors_settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)

admin = Admin(app, engine, title="Aspire Admin")
admin.add_view(UserAdmin)
admin.add_view(AdmissionAdmin)
admin.add_view(ContentAdmin)

app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["Auth"])
app.include_router(admissions.router, prefix="/api/v1/admissions", tags=["Admissions"])
app.include_router(content.router,    prefix="/api/v1/content",    tags=["Content"])
app.include_router(ai_tutor.router,   prefix="/api/v1",            tags=["AI Tutor"])
app.include_router(contact.router,    prefix="/api/v1/contact",    tags=["Contact"])
app.include_router(reviews.router,    prefix="/api/v1/reviews",    tags=["Reviews"])
app.include_router(admin_api.router,  prefix="/api/v1/admin",      tags=["Admin"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Aspire Learning Hub API"}
