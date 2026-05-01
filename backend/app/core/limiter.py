from slowapi import Limiter
from starlette.requests import Request


def _real_ip(request: Request) -> str:
    """Extract the genuine client IP from X-Forwarded-For when behind a proxy.

    Render (and most cloud reverse proxies) set X-Forwarded-For to the original
    client IP.  Falling back to request.client.host means every user would share
    one rate-limit bucket on a proxy-terminated deployment, making the limiter
    effectively useless.
    """
    xff = request.headers.get("X-Forwarded-For", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


limiter = Limiter(key_func=_real_ip)
