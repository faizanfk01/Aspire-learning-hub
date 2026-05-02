from slowapi import Limiter
from starlette.requests import Request


def _real_ip(request: Request) -> str:
    # Behind a proxy every request shares the same client.host — use X-Forwarded-For so limits work per user.
    xff = request.headers.get("X-Forwarded-For", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


limiter = Limiter(key_func=_real_ip)
