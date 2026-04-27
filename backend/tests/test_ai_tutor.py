"""Tests for POST /chat and POST /chat/stream.

Groq API calls are mocked so these tests run without a real API key.
"""
import json
from unittest.mock import AsyncMock, patch


CHAT_PAYLOAD = {"message": "What is the Pythagorean theorem?"}
CHAT_WITH_SUBJECT = {"message": "Solve x² + 5x + 6 = 0", "subject": "Mathematics"}


# ── /chat (non-streaming) ──────────────────────────────────────────────────────

def test_chat_requires_auth(client):
    resp = client.post("/api/v1/chat", json=CHAT_PAYLOAD)
    assert resp.status_code == 401


def test_chat_returns_response(client, auth_headers):
    mock_result = {"response": "The theorem states a² + b² = c².", "model": "llama-3.3-70b-versatile"}

    with patch("app.api.v1.ai_tutor.ask_groq", new=AsyncMock(return_value=mock_result)):
        resp = client.post("/api/v1/chat", json=CHAT_PAYLOAD, headers=auth_headers)

    assert resp.status_code == 200
    body = resp.json()
    assert "response" in body
    assert "model" in body
    assert body["response"] == "The theorem states a² + b² = c²."


def test_chat_passes_subject_to_service(client, auth_headers):
    mock_result = {"response": "x = -2 or x = -3", "model": "llama-3.3-70b-versatile"}

    with patch("app.api.v1.ai_tutor.ask_groq", new=AsyncMock(return_value=mock_result)) as mock_fn:
        resp = client.post("/api/v1/chat", json=CHAT_WITH_SUBJECT, headers=auth_headers)

    assert resp.status_code == 200
    mock_fn.assert_called_once_with(
        "Solve x² + 5x + 6 = 0",
        "Mathematics",
    )


def test_chat_upstream_error_returns_502(client, auth_headers):
    with patch(
        "app.api.v1.ai_tutor.ask_groq",
        new=AsyncMock(side_effect=Exception("upstream timeout")),
    ):
        resp = client.post("/api/v1/chat", json=CHAT_PAYLOAD, headers=auth_headers)

    assert resp.status_code == 502
    assert "AI service error" in resp.json()["detail"]


# ── /chat/stream (SSE) ────────────────────────────────────────────────────────

async def _fake_stream(*args, **kwargs):
    """Async generator that yields three tokens."""
    for token in ["Hello", " World", "!"]:
        yield token


def test_chat_stream_requires_auth(client):
    resp = client.post("/api/v1/chat/stream", json=CHAT_PAYLOAD)
    assert resp.status_code == 401


def test_chat_stream_yields_sse_events(client, auth_headers):
    with patch("app.api.v1.ai_tutor.ask_groq_stream", side_effect=_fake_stream):
        resp = client.post(
            "/api/v1/chat/stream",
            json=CHAT_PAYLOAD,
            headers=auth_headers,
        )

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]

    lines = [line for line in resp.text.splitlines() if line.startswith("data:")]
    # Expect 3 token events + [DONE]
    assert len(lines) == 4
    assert lines[-1] == "data: [DONE]"

    # Each token line must be valid JSON with a "token" key
    for line in lines[:-1]:
        payload = json.loads(line[len("data: "):])
        assert "token" in payload


def test_chat_stream_with_subject(client, auth_headers):
    with patch("app.api.v1.ai_tutor.ask_grok_stream", side_effect=_fake_stream) as mock_fn:
        client.post(
            "/api/v1/chat/stream",
            json=CHAT_WITH_SUBJECT,
            headers=auth_headers,
        )
    mock_fn.assert_called_once_with("Solve x² + 5x + 6 = 0", "Mathematics")
