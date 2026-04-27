import asyncio
import json
from typing import AsyncIterator

import httpx

from app.core.config import settings

_BASE_SYSTEM_PROMPT = (
    "You are an expert AI tutor for Aspire Learning Hub. "
    "Help students understand academic concepts clearly and concisely. "
    "Always show step-by-step working when solving problems. "
    "If a question is unrelated to academics, politely redirect the student."
)

_MAX_RETRIES = 3
_RETRY_DELAY = 2  # seconds


def _build_messages(message: str, subject: str | None) -> list[dict]:
    system = _BASE_SYSTEM_PROMPT
    if subject:
        system += f" The student is currently studying: {subject}."
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": message},
    ]


def _extract_api_error(resp: httpx.Response) -> str:
    """Pull the human-readable reason out of a Groq error response body."""
    try:
        body = resp.json()
        # OpenAI-compatible format: {"error": {"message": "..."}}
        if isinstance(body.get("error"), dict):
            return body["error"].get("message", json.dumps(body))
        # Flat format: {"detail": "..."}
        if "detail" in body:
            return str(body["detail"])
        return json.dumps(body)
    except Exception:
        return resp.text or f"HTTP {resp.status_code}"


async def ask_groq(message: str, subject: str | None = None) -> dict:
    """Send a question to Groq and return the full response. Retries on rate-limit."""
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": _build_messages(message, subject),
        "max_tokens": 1024,
        "temperature": 0.7,
    }

    last_exc: Exception | None = None
    for attempt in range(_MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.GROQ_API_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                )

                # Rate-limited — back off and retry
                if resp.status_code == 429:
                    await asyncio.sleep(_RETRY_DELAY * (attempt + 1))
                    last_exc = RuntimeError(f"Rate limited by Groq API (attempt {attempt + 1})")
                    continue

                # Any other non-2xx: extract the real reason and raise immediately
                if not resp.is_success:
                    reason = _extract_api_error(resp)
                    raise RuntimeError(
                        f"Groq API returned {resp.status_code}: {reason}"
                    )

                data = resp.json()
                return {
                    "response": data["choices"][0]["message"]["content"],
                    "model": data.get("model", settings.GROQ_MODEL),
                }

        except httpx.TimeoutException as exc:
            last_exc = exc
            await asyncio.sleep(_RETRY_DELAY)

    raise last_exc or RuntimeError("Groq request failed after retries")


async def ask_groq_stream(
    message: str, subject: str | None = None
) -> AsyncIterator[str]:
    """Stream Groq's response token-by-token (Server-Sent Events)."""
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": _build_messages(message, subject),
        "max_tokens": 1024,
        "temperature": 0.7,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            f"{settings.GROQ_API_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        ) as resp:
            if not resp.is_success:
                # Read the full body before raising so we can show the real error
                await resp.aread()
                reason = _extract_api_error(resp)
                raise RuntimeError(f"Groq API returned {resp.status_code}: {reason}")

            async for raw_line in resp.aiter_lines():
                if not raw_line.startswith("data: "):
                    continue
                chunk = raw_line[6:]
                if chunk.strip() == "[DONE]":
                    break
                try:
                    data = json.loads(chunk)
                    delta = data["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield delta
                except (json.JSONDecodeError, KeyError):
                    continue
