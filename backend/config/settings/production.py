"""
ManMitra — Production Settings
PostgreSQL, SMTP email, strict CORS, security headers, S3 media storage.
Activate with: DJANGO_SETTINGS_MODULE=config.settings.production
"""
from .base import *  # noqa: F401, F403
from decouple import config
import dj_database_url

DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])

# Auto-detect Render external hostname for ALLOWED_HOSTS
RENDER_EXTERNAL_HOSTNAME = config('RENDER_EXTERNAL_HOSTNAME', default='')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    if not RENDER_EXTERNAL_HOSTNAME.endswith('.onrender.com'):
        ALLOWED_HOSTS.append(f"{RENDER_EXTERNAL_HOSTNAME}.onrender.com")


# ─────────────────────────────────────────────
# Database — PostgreSQL for production (Supabase / Neon)
# ─────────────────────────────────────────────
DATABASE_URL = config('DATABASE_URL', default='')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=60,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default=''),
            'USER': config('DB_USER', default=''),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
            'CONN_MAX_AGE': 60,
        }
    }

# ─────────────────────────────────────────────
# Email — Production SMTP (AWS SES recommended)
# ─────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# ─────────────────────────────────────────────
# CORS & CSRF — Restricted to known frontend origins
# ─────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://manmitra.ai,https://www.manmitra.ai',
    cast=lambda v: [s.rstrip('/').strip() for s in v.split(',') if s.strip()]
)
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default=','.join(CORS_ALLOWED_ORIGINS) if CORS_ALLOWED_ORIGINS else 'https://manmitra.ai',
    cast=lambda v: [s.rstrip('/').strip() for s in v.split(',') if s.strip()]
)


# ─────────────────────────────────────────────
# Security Headers
# ─────────────────────────────────────────────
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# ─────────────────────────────────────────────
# Logging — File + error reporting
# ─────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name}: {message}',
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
        'level': 'WARNING',
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'ERROR', 'propagate': False},
        'apps': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
    },
}

# ─────────────────────────────────────────────
# WhiteNoise — Static Files Serving
# ─────────────────────────────────────────────
# Insert WhiteNoiseMiddleware right after SecurityMiddleware in MIDDLEWARE
if 'django.middleware.security.SecurityMiddleware' in MIDDLEWARE:
    idx = MIDDLEWARE.index('django.middleware.security.SecurityMiddleware')
    MIDDLEWARE.insert(idx + 1, 'whitenoise.middleware.WhiteNoiseMiddleware')
else:
    MIDDLEWARE.insert(0, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Serve compressed and cached static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
