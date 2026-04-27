import random
import string


def generate_code() -> str:
    """Return a cryptographically-adequate 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=6))
