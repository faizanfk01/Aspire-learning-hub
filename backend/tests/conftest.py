"""
Test configuration.

Strategy
--------
* Set TESTING=1 before any app import so main.py skips the PostgreSQL retry loop.
* Replace the real SQLAlchemy engine with an in-memory SQLite engine (StaticPool so
  all sessions share the same single in-memory database).
* Override the `get_db` FastAPI dependency so every request uses the SQLite session.
* Wipe all rows between tests so each test starts clean (schema stays intact).
"""
import os

# Must be set BEFORE importing anything from the app
os.environ["TESTING"] = "1"
# Provide dummy values so pydantic-settings doesn't raise at import time
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# ── Test database setup ───────────────────────────────────────────────────────
TEST_DB_URL = "sqlite://"  # pure in-memory, shared across connections via StaticPool

test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Patch the database module BEFORE importing the app so every internal reference
# that reads `engine` or `SessionLocal` from app.core.database gets the test versions.
import app.core.database as _db_module  # noqa: E402

_db_module.engine = test_engine
_db_module.SessionLocal = TestingSession

# Now it's safe to import the app and models
from app.models import Base  # noqa: E402
from app.main import app  # noqa: E402
from app.api.deps import get_db  # noqa: E402

# Create all tables once on the in-memory engine
Base.metadata.create_all(bind=test_engine)


# ── Dependency override ───────────────────────────────────────────────────────
def _override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


# ── Fixtures ──────────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def client():
    """A single TestClient shared by the whole test session."""
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


@pytest.fixture(autouse=True)
def clean_db():
    """Delete all rows between tests; keep the schema."""
    yield
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()


# ── Reusable helper fixtures ──────────────────────────────────────────────────
@pytest.fixture()
def standard_user_token(client):
    """Register a standard user and return their Bearer token."""
    client.post("/api/v1/auth/signup", json={
        "full_name": "Test Student",
        "email": "student@test.com",
        "password": "password123",
        "role": "standard",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "student@test.com",
        "password": "password123",
    })
    return resp.json()["access_token"]


@pytest.fixture()
def admin_token(client):
    """Register an admin user and return their Bearer token."""
    client.post("/api/v1/auth/signup", json={
        "full_name": "Admin User",
        "email": "admin@test.com",
        "password": "adminpass123",
        "role": "admin",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@test.com",
        "password": "adminpass123",
    })
    return resp.json()["access_token"]


@pytest.fixture()
def auth_headers(standard_user_token):
    return {"Authorization": f"Bearer {standard_user_token}"}


@pytest.fixture()
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
