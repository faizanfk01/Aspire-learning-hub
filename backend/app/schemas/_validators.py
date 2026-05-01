"""Shared Pydantic field validators for all input schemas.

SQL Injection
─────────────
All database access goes through SQLAlchemy's ORM, which uses parameterized
queries exclusively.  User input is never interpolated into raw SQL strings, so
SQL injection is structurally impossible at the query layer.  The validators
below do NOT attempt to detect SQL syntax in input values because doing so would
both produce false positives (legitimate text containing "DROP" or "--") and
provide false security for any code path that bypasses the ORM.

XSS
───
The API returns JSON.  Browsers do not interpret JSON responses as HTML, so XSS
via API response body is not possible.  The React frontend uses JSX which
auto-escapes all interpolated values, closing the reflected-XSS path.  Data
written into HTML email templates is escaped by the `_esc()` helper in
email_service.py.

What these validators DO enforce
─────────────────────────────────
• Strip leading/trailing whitespace (prevents field values that are technically
  non-empty but consist only of spaces passing min_length checks).
• Reject ASCII control characters (null bytes, DEL, etc.) that have no
  legitimate place in user-facing text fields and can corrupt downstream
  storage, logs, or output rendering.
"""

import re

# Match ASCII control characters excluding horizontal tab (\x09), line feed
# (\x0a), and carriage return (\x0d) — those three are legitimate in
# multi-line free-text fields such as "message" or "struggling_with".
_CTRL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def clean(v: str) -> str:
    """Strip whitespace and reject invisible control characters."""
    v = v.strip()
    if _CTRL.search(v):
        raise ValueError("Value contains invalid control characters")
    return v


def clean_optional(v: str | None) -> str | None:
    if v is None:
        return v
    return clean(v)
