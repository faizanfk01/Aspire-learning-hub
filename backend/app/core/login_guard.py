"""Per-email login failure tracking for brute-force / credential-stuffing protection.

Complements the IP-based slowapi rate limit on /login.  State is in-process and
resets on restart — acceptable for a single-worker Render deployment.  Swap the
defaultdict for a Redis hash if you ever scale to multiple workers.
"""
import threading
from collections import defaultdict
from datetime import datetime, timedelta, timezone

WINDOW_MINUTES = 15
MAX_FAILURES = 5

_failures: dict[str, list[datetime]] = defaultdict(list)
_lock = threading.Lock()


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _prune(email: str) -> list[datetime]:
    cutoff = _utcnow() - timedelta(minutes=WINDOW_MINUTES)
    recent = [t for t in _failures[email] if t > cutoff]
    _failures[email] = recent
    return recent


def is_locked_out(email: str) -> bool:
    with _lock:
        return len(_prune(email.lower())) >= MAX_FAILURES


def record_failure(email: str) -> None:
    with _lock:
        recent = _prune(email.lower())
        recent.append(_utcnow())
        _failures[email.lower()] = recent


def clear_failures(email: str) -> None:
    with _lock:
        _failures.pop(email.lower(), None)
