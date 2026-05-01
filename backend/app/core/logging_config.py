"""Centralised logging configuration for Aspire Learning Hub.

Call configure_logging() once at application startup before any loggers are used.

Logger hierarchy
----------------
aspire.access   – one line per HTTP request (method, path, status, duration, IP)
aspire.security – auth events: login ok/fail, lockout, OTP, signup, probes
aspire          – everything else inside the app (parent of the above two)

Third-party noise is suppressed: uvicorn's built-in access log is silenced
because our middleware writes its own; SQLAlchemy stays at WARNING.
"""

import logging
import logging.config
import os

_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

_CONFIG: dict = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)-22s | %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%SZ",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "formatter": "default",
        },
    },
    "loggers": {
        # All app loggers inherit from "aspire"
        "aspire": {
            "level": _LEVEL,
            "handlers": ["console"],
            "propagate": False,
        },
        # Suppress uvicorn's per-request access log (our middleware replaces it)
        "uvicorn.access": {
            "level": "WARNING",
            "handlers": [],
            "propagate": False,
        },
        "uvicorn.error": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        # Only log SQL at WARNING (flip to DEBUG locally to see queries)
        "sqlalchemy.engine": {
            "level": "WARNING",
            "handlers": ["console"],
            "propagate": False,
        },
    },
    "root": {
        "level": "WARNING",
        "handlers": ["console"],
    },
}


def configure_logging() -> None:
    logging.config.dictConfig(_CONFIG)
