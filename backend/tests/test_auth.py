"""Tests for POST /auth/signup, POST /auth/login, GET /auth/me."""


def test_signup_returns_202_with_message(client):
    resp = client.post("/api/v1/auth/signup", json={
        "full_name": "Alice",
        "email": "alice@example.com",
        "password": "secret123",
    })
    assert resp.status_code == 202
    assert resp.json() == {"message": "OTP sent to your email."}


def test_signup_short_password_rejected(client):
    resp = client.post("/api/v1/auth/signup", json={
        "full_name": "Alice",
        "email": "alice@example.com",
        "password": "short",
    })
    assert resp.status_code == 422


def test_signup_duplicate_inactive_resends_otp(client):
    payload = {"full_name": "Bob", "email": "bob@example.com", "password": "password123"}
    client.post("/api/v1/auth/signup", json=payload)
    resp = client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 202


def test_signup_duplicate_active_user_rejected(client, make_active_user):
    make_active_user("charlie@example.com", "password123", "Charlie")
    resp = client.post("/api/v1/auth/signup", json={
        "full_name": "Charlie",
        "email": "charlie@example.com",
        "password": "password123",
    })
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"]


def test_login_returns_token(client, make_active_user):
    make_active_user("carol@example.com", "mypassword8", "Carol")
    resp = client.post("/api/v1/auth/login", data={
        "username": "carol@example.com",
        "password": "mypassword8",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_inactive_user_rejected(client):
    client.post("/api/v1/auth/signup", json={
        "full_name": "Dave",
        "email": "dave@example.com",
        "password": "mypassword8",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "dave@example.com",
        "password": "mypassword8",
    })
    assert resp.status_code == 403


def test_login_wrong_password(client):
    client.post("/api/v1/auth/signup", json={
        "full_name": "Eve",
        "email": "eve@example.com",
        "password": "correctpass",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "eve@example.com",
        "password": "wrongpass1",
    })
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/v1/auth/login", data={
        "username": "ghost@example.com",
        "password": "anything1",
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
