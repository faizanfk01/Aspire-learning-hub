import os
import sys
import time
from contextlib import asynccontextmanager

# 1. FIX PATHS FIRST (Before any other 'app.' imports)
current_dir = os.path.dirname(os.path.abspath(__file__)) # /app/app
parent_dir = os.path.dirname(current_dir)                # /app

if current_dir not in sys.path:
    sys.path.append(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

import sqlalchemy.exc
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin

# 2. CHOOSE ONE IMPORT STYLE
# If Docker WORKDIR is /app, we use 'app.xxx'. 
# This try/except block handles both local and Render environments.
try:
    from app.admin import AdmissionAdmin, ContentAdmin, UserAdmin
    from app.api.v1 import admissions, ai_tutor, auth, content
    from app.core.database import engine
    from app.models import Base 
except ModuleNotFoundError:
    from admin import AdmissionAdmin, ContentAdmin, UserAdmin
    from api.v1 import admissions, ai_tutor, auth, content
    from core.database import engine
    from models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("TESTING"):
        print("[startup] TESTING mode — skipping DB retry loop.")
    else:
        connected = False
        while not connected:
            try:
                # Use the Base imported above
                Base.metadata.create_all(bind=engine)
                connected = True
                print("[startup] Database tables verified / created.")
            except sqlalchemy.exc.OperationalError:
                print("[startup] Database not ready — retrying in 2 s...")
                time.sleep(2)
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


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Aspire Learning Hub API"}
