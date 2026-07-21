import os
import sys
import django
from decouple import config as env_config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402


def create_superuser_if_not_exists():
    import secrets
    User = get_user_model()

    email     = env_config('SUPERUSER_EMAIL', default='')
    password  = env_config('SUPERUSER_PASSWORD', default='')
    full_name = env_config('SUPERUSER_FULL_NAME', default='Admin User')

    if email and password:
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password=password,
                full_name=full_name,
                role='admin',
                is_staff=True,
                is_superuser=True,
                is_verified=True,
            )

    # ── Seed test accounts (development / DEBUG only) ──────────────────────
    from django.conf import settings
    if not settings.DEBUG:
        return

    # Regular User
    user_email    = env_config('TEST_USER_EMAIL', default='user@manmitra.ai')
    user_password = env_config('TEST_USER_PASSWORD', default='')
    if not User.objects.filter(email=user_email).exists():
        User.objects.create_user(
            email=user_email,
            password=user_password or secrets.token_urlsafe(16),
            full_name='Jane Doe',
            role='user',
            is_verified=True,
        )

    # Therapist User
    therapist_email    = env_config('TEST_THERAPIST_EMAIL', default='therapist@manmitra.ai')
    therapist_password = env_config('TEST_THERAPIST_PASSWORD', default='')
    if not User.objects.filter(email=therapist_email).exists():
        User.objects.create_user(
            email=therapist_email,
            password=therapist_password or secrets.token_urlsafe(16),
            full_name='Dr. Sarah Smith',
            role='therapist',
            is_verified=True,
        )


if __name__ == '__main__':
    create_superuser_if_not_exists()
