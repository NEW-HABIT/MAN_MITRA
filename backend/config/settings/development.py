"""
ManMitra — Development Settings
Supabase PostgreSQL database, verbose logging, debug toolbar, console email backend.
"""
from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['*']

import dj_database_url
from decouple import config

# ─────────────────────────────────────────────
# Database — Supabase PostgreSQL (required in all environments)
# ─────────────────────────────────────────────
DATABASE_URL = config('DATABASE_URL', default='')

if not DATABASE_URL or '[YOUR-PASSWORD]' in DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set or still contains '[YOUR-PASSWORD]'. "
        "Please set a valid Supabase PostgreSQL URL in your .env file."
    )

DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=60,
        ssl_require=True
    )
}

# ─────────────────────────────────────────────
# Email — Resend SMTP if configured, else console
# ─────────────────────────────────────────────
EMAIL_HOST = config('EMAIL_HOST', default='smtp.resend.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='resend')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='ManMitra <onboarding@resend.dev>')

if EMAIL_HOST_PASSWORD and 'your_resend_api_key' not in EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    if EMAIL_PORT == 465:
        EMAIL_USE_TLS = False
        EMAIL_USE_SSL = True
    else:
        EMAIL_USE_TLS = True
        EMAIL_USE_SSL = False
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


# ─────────────────────────────────────────────
# CORS — Allow all origins in development
# ─────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# ─────────────────────────────────────────────
# Django Debug Toolbar (Disabled to prevent psycopg v2/v3 mismatch error)
# ─────────────────────────────────────────────
# try:
#     import debug_toolbar  # noqa
#     INSTALLED_APPS += ['debug_toolbar']
#     MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
#     INTERNAL_IPS = ['127.0.0.1']
# except ImportError:
#     pass


# ─────────────────────────────────────────────
# Logging — Verbose SQL + Django logs
# ─────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name}: {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'core': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ─────────────────────────────────────────────
# Security — Relaxed for development
# ─────────────────────────────────────────────
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
