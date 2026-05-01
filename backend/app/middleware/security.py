"""Security-related ASGI middleware.

SecurityHeadersMiddleware
    Attaches defensive HTTP headers to every response.
    HSTS is only sent when the request arrived via HTTPS (checked via
    X-Forwarded-Proto so it works correctly behind Render's TLS proxy).

RequestLoggingMiddleware
    Logs one line per request to the aspire.access logger.
    - 2xx → INFO
    - 4xx → WARNING  (includes the client IP for investigation)
    - 5xx → ERROR
    Also detects and warns on common scanner/exploit probe paths.
"""

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

_access = logging.getLogger("aspire.access")
_security = logging.getLogger("aspire.security")

# Common paths targeted by automated scanners and exploit bots.
_PROBE_PREFIXES: tuple[str, ...] = (
    "/.env",
    "/.git",
    "/.htaccess",
    "/wp-",
    "/wordpress",
    "/xmlrpc",
    "/phpinfo",
    "/phpmyadmin",
    "/admin.php",
    "/config.php",
    "/etc/",
    "/proc/",
    "/cgi-bin/",
    "/shell",
    "/actuator",   # Spring Boot probes
    "/console",    # JBoss / Glassfish
)


def client_ip(request: Request) -> str:
    """Return the real client IP, preferring X-Forwarded-For (set by Render's proxy)."""
    xff = request.headers.get("X-Forwarded-For", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        h = response.headers

        h["X-Content-Type-Options"] = "nosniff"
        h["X-Frame-Options"] = "DENY"
        h["Referrer-Policy"] = "strict-origin-when-cross-origin"
        h["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # HSTS is only meaningful over TLS. Render terminates SSL at the proxy
        # and forwards internally as HTTP, so we check X-Forwarded-Proto.
        proto = request.headers.get("X-Forwarded-Proto", request.url.scheme)
        if proto == "https":
            h["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        ip = client_ip(request)
        method = request.method
        path = request.url.path

        # Flag scanner / exploit probe traffic before even processing the request.
        if any(path.lower().startswith(p) for p in _PROBE_PREFIXES):
            _security.warning(
                "probe_attempt method=%s path=%s ip=%s user_agent=%r",
                method,
                path,
                ip,
                request.headers.get("User-Agent", ""),
            )

        t0 = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            ms = round((time.perf_counter() - t0) * 1000, 1)
            msg = "%s %s → %s  %sms  ip=%s"
            args = (method, path, status_code, ms, ip)
            if status_code >= 500:
                _access.error(msg, *args)
            elif status_code >= 400:
                _access.warning(msg, *args)
            else:
                _access.info(msg, *args)
