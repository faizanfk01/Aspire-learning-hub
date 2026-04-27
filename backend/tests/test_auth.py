"""Tests for POST /auth/signup, POST /auth/login, GET /auth/me."""


def test_signup_creates_user(client):
    resp = client.post("/api/v1/auth/signup", json={
        "full_name": "Alice",
        "email": "alice@example.com",
        "password": "secret123",
        "role": "standard",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "alice@example.com"
    assert body["role"] == "standard"
    assert body["is_active"] is True
    assert "hashed_password" not in body


def test_signup_duplicate_email_rejected(client):
    payload = {"full_name": "Bob", "email": "bob@example.com", "password": "pw", "role": "standard"}
    client.post("/api/v1/auth/signup", json=payload)
    resp = client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"]


def test_signup_admin_role(client):
    resp = client.post("/api/v1/auth/signup", json={
        "full_name": "Admin",
        "email": "admin@example.com",
        "password": "adminpw",
        "role": "admin",
    })
    assert resp.status_code == 201
    assert resp.json()["role"] == "admin"


def test_login_returns_token(client):
    client.post("/api/v1/auth/signup", json={
        "full_name": "Carol",
        "email": "carol@example.com",
        "password": "mypassword",
        "role": "standard",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "carol@example.com",
        "password": "mypassword",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/api/v1/auth/signup", json={
        "full_name": "Dave",
        "email": "dave@example.com",
        "password": "correct",
        "role": "standard",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "dave@example.com",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/v1/auth/login", data={
        "username": "ghost@example.com",
        "password": "anything",
    })
    assert resp.status_code == 401


def test_get_me_returns_current_user(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "student@test.com"


def test_get_me_requires_auth(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_get_me_invalid_token(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bad.token.here"})
    assert resp.status_code == 401
