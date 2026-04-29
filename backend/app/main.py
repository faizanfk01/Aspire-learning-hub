import os
import secrets
import sys
import time
from contextlib import asynccontextmanager
from datetime import timedelta

# 1. FIX PATHS FIRST (Before any other 'app.' imports)
current_dir = os.path.dirname(os.path.abspath(__file__)) # /app/app
parent_dir = os.path.dirname(current_dir)                # /app

if current_dir not in sys.path:
    sys.path.append(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

import sqlalchemy.exc
from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin

# 2. CHOOSE ONE IMPORT STYLE
# If Docker WORKDIR is /app, we use 'app.xxx'.
# This try/except block handles both local and Render environments.
try:
    from app.admin import AdmissionAdmin, ContentAdmin, UserAdmin
    from app.api.v1 import admissions, ai_tutor, auth, content, contact, reviews
    from app.api.v1 import admin as admin_api
    from app.core.database import engine
    from app.models import Base
except ModuleNotFoundError:
    from admin import AdmissionAdmin, ContentAdmin, UserAdmin
    from api.v1 import admissions, ai_tutor, auth, content, contact, reviews
    from api.v1 import admin as admin_api
    from core.database import engine
    from models import Base

async def _seed_admin() -> None:
    """Create the admin user on first boot and email a password-setup link."""
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
        if db.query(User).filter(User.email == "aspireslearninghub@gmail.com").first():
            return  # Admin already exists — nothing to do

        admin = User(
            full_name="Aspire Admin",
            email="aspireslearninghub@gmail.com",
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
        await email_service.send_password_reset_email(
            admin.email,
            "Aspire Admin",
            reset_link,
        )
        print("[startup] Admin user created — password-setup email sent to aspireslearninghub@gmail.com")
    except Exception as exc:
        print(f"[startup] Admin seeder error: {exc}")
        db.rollback()
    finally:
        db.close()


def _run_migrations() -> None:
    # create_all is a fast no-op for existing tables; it only creates tables
    # that are entirely absent (covers fresh-database first-boot).
    Base.metadata.create_all(bind=engine)

    # Then apply Alembic migrations so any new columns are added to existing
    # tables.  The migration files use IF NOT EXISTS, so they're safe to run
    # on a fresh DB where create_all already added those columns.
    alembic_ini = os.path.join(parent_dir, "alembic.ini")
    if os.path.exists(alembic_ini):
        cfg = AlembicConfig(alembic_ini)
        alembic_command.upgrade(cfg, "head")
        print("[startup] Alembic migrations applied to head.")
    else:
        print(f"[startup] alembic.ini not found at {alembic_ini} — skipping migrations.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("TESTING"):
        print("[startup] TESTING mode — skipping DB setup.")
    else:
        connected = False
        while not connected:
            try:
                _run_migrations()
                connected = True
            except sqlalchemy.exc.OperationalError:
                print("[startup] Database not ready — retrying in 2 s...")
                time.sleep(2)
        await _seed_admin()
    yield

app = FastAPI(
    title="Aspire Learning Hub API",
    version="1.0.0",
    description="Backend API for the Aspire Learning Hub academy management system.",
    lifespan=lifespan,
)

origins = [
    "http://localhost:3000",
    "https://www.aspirelearninghub.com.pk",
    "https://aspirelearninghub.com.pk",
    "https://aspire-learning-hub.onrender.com", # Your backend itself
]

# ── CORS (allow Next.js dev server and any future deployment origin) ─────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── SQLAdmin dashboard (/admin) ───────────────────────────────────────────────
admin = Admin(app, engine, title="Aspire Admin")
admin.add_view(UserAdmin)
admin.add_view(AdmissionAdmin)
admin.add_view(ContentAdmin)

# ── API routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/api/v1/auth",        tags=["Auth"])
app.include_router(admissions.router, prefix="/api/v1/admissions",  tags=["Admissions"])
app.include_router(content.router,    prefix="/api/v1/content",     tags=["Content"])
app.include_router(ai_tutor.router,   prefix="/api/v1",             tags=["AI Tutor"])
app.include_router(contact.router,    prefix="/api/v1/contact",     tags=["Contact"])
app.include_router(reviews.router,    prefix="/api/v1/reviews",     tags=["Reviews"])
app.include_router(admin_api.router,  prefix="/api/v1/admin",        tags=["Admin"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Aspire Learning Hub API"}
