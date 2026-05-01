import re

# Exclude \t, \n, \r — legitimate in multi-line fields.
_CTRL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def clean(v: str) -> str:
    v = v.strip()
    if _CTRL.search(v):
        raise ValueError("Value contains invalid control characters")
    return v


def clean_optional(v: str | None) -> str | None:
    if v is None:
        return v
    return clean(v)
