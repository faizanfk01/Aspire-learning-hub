import os
import time
from contextlib import asynccontextmanager

import sqlalchemy.exc
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin

from app.admin import AdmissionAdmin, ContentAdmin, UserAdmin
from app.api.v1 import admissions, ai_tutor, auth, content
from app.core.database import engine
from app.models import Base  # side-effect: registers all models on Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    # Skip the retry loop when running the test suite (SQLite is used instead).
    if os.getenv("TESTING"):
        print("[startup] TESTING mode — skipping DB retry loop.")
    else:
        # Retry until PostgreSQL is ready (container race-condition guard).
        connected = False
        while not connected:
            try:
                Base.metadata.create_all(bind=engine)
                connected = True
                print("[startup] Database tables verified / created.")
            except sqlalchemy.exc.OperationalError:
                print("[startup] Database not ready — retrying in 2 s...")
                time.sleep(2)
    yield
    # ── Shutdown (nothing to clean up for now) ────────────────────────────────


app = FastAPI(
    title="Aspire Learning Hub API",
    version="1.0.0",
    description="Backend API for the Aspire Learning Hub academy management system.",
    lifespan=lifespan,
)

# ── CORS (allow Next.js dev server and any future deployment origin) ─────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Aspire Learning Hub API"}
