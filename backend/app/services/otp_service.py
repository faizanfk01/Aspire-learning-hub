import secrets


def generate_code() -> str:
    """Return a cryptographically secure 6-digit numeric OTP."""
    return "".join(str(secrets.randbelow(10)) for _ in range(6))
