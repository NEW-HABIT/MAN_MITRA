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

    # Seed additional test accounts in development mode (DEBUG=True)
    if settings.DEBUG:
        import secrets

        # 1. Regular User
        user_email = 'user@manmitra.ai'
        if not User.objects.filter(email=user_email).exists():
            user_password = os.environ.get('TEST_USER_PASSWORD')
            is_random = False
            if not user_password:
                user_password = secrets.token_urlsafe(16)
                is_random = True

            print(f"🚀 Creating test regular user: {user_email}...")
            User.objects.create_user(
                email=user_email,
                password=user_password,
                full_name='Jane Doe',
                role='user',
                is_verified=True
            )
            if is_random:
                print(f"🔑 Test user created. Login password: {user_password}")
            else:
                print("✅ Test regular user created successfully.")
        else:
            print(f"ℹ️ Test regular user {user_email} already exists. Skipping.")

        # 2. Therapist / Doctor User
        therapist_email = 'therapist@manmitra.ai'
        if not User.objects.filter(email=therapist_email).exists():
            therapist_password = os.environ.get('TEST_THERAPIST_PASSWORD')
            is_random = False
            if not therapist_password:
                therapist_password = secrets.token_urlsafe(16)
                is_random = True

            print(f"🚀 Creating test therapist: {therapist_email}...")
            User.objects.create_user(
                email=therapist_email,
                password=therapist_password,
                full_name='Dr. Sarah Smith',
                role='therapist',
                is_verified=True
            )
            if is_random:
                print(f"🔑 Test therapist created. Login password: {therapist_password}")
            else:
                print("✅ Test therapist created successfully.")
        else:
            print(f"ℹ️ Test therapist {therapist_email} already exists. Skipping.")

if __name__ == '__main__':
    create_superuser_if_not_exists()
