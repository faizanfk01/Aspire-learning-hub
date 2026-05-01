import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

_access = logging.getLogger("aspire.access")
_security = logging.getLogger("aspire.security")

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
    "/actuator",
    "/console",
)


def client_ip(request: Request) -> str:
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

        proto = request.headers.get("X-Forwarded-Proto", request.url.scheme)
        if proto == "https":
            h["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        ip = client_ip(request)
        method = request.method
        path = request.url.path

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
