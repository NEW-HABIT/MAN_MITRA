import os
import django

# Set Django settings module and initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.contrib.auth import get_user_model

def create_superuser_if_not_exists():
    from django.conf import settings
    User = get_user_model()
    email = os.environ.get('SUPERUSER_EMAIL')
    password = os.environ.get('SUPERUSER_PASSWORD')
    full_name = os.environ.get('SUPERUSER_FULL_NAME', 'Admin User')

    if not email or not password:
        if settings.DEBUG:
            email = email or 'admin@manmitra.ai'
            password = password or 'AdminPassword123!'
            print(f"⚠️ Using development fallback credentials since DEBUG is True: {email}")
        else:
            print("⚠️ SUPERUSER_EMAIL or SUPERUSER_PASSWORD environment variables not set. Skipping automatic superuser creation.")
            return

    if not User.objects.filter(email=email).exists():
        print(f"🚀 Creating superuser: {email}...")
        User.objects.create_superuser(
            email=email,
            password=password,
            full_name=full_name,
            role='admin',        # Match the custom User role choice
            is_staff=True,
            is_superuser=True,
            is_verified=True
        )
        print("✅ Superuser created successfully.")
    else:
        print(f"ℹ️ Superuser {email} already exists. Skipping creation.")

if __name__ == '__main__':
    create_superuser_if_not_exists()
