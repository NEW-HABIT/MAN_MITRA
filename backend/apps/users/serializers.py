"""
ManMitra — User Serializers
Handles all data transformation for authentication and profile management.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import WellnessProfile

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Registration & Auth
# ─────────────────────────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Handles new user registration. Validates password strength and match."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='Minimum 8 characters.'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='Must match the password field.'
    )

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'password_confirm']

    def validate_email(self, value: str) -> str:
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def validate(self, attrs: dict) -> dict:
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        # Run Django's built-in password validators
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs

    def create(self, validated_data: dict) -> User:
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Auto-create wellness profile
        WellnessProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    """Validates login credentials."""
    email = serializers.EmailField(help_text='Registered email address.')
    password = serializers.CharField(
        style={'input_type': 'password'},
        help_text='Account password.'
    )


class TokenResponseSerializer(serializers.Serializer):
    """Shape of the JWT token response."""
    access = serializers.CharField()
    refresh = serializers.CharField()


# ─────────────────────────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────────────────────────

class WellnessProfileSerializer(serializers.ModelSerializer):
    """Read/update the user's wellness profile (onboarding data)."""

    class Meta:
        model = WellnessProfile
        fields = [
            'sleep_schedule',
            'stress_level',
            'primary_goals',
            'wellness_preferences',
            'onboarding_done',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate_stress_level(self, value: int) -> int:
        if not (1 <= value <= 10):
            raise serializers.ValidationError('Stress level must be between 1 and 10.')
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Full user profile — for GET /api/auth/me/ responses."""

    wellness_profile = WellnessProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'date_of_birth', 'gender',
            'occupation', 'role', 'is_verified', 'avatar',
            'created_at', 'updated_at', 'wellness_profile',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Partial update of user profile fields (PATCH /api/auth/me/)."""

    class Meta:
        model = User
        fields = ['full_name', 'date_of_birth', 'gender', 'occupation', 'avatar']

    def validate_full_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Full name must be at least 2 characters.')
        return value


# ─────────────────────────────────────────────────────────────────────────────
# Email Verification
# ─────────────────────────────────────────────────────────────────────────────

class EmailVerificationSerializer(serializers.Serializer):
    """Accepts the signed email verification token."""
    token = serializers.CharField(help_text='Signed token received in the verification email.')


class ResendVerificationSerializer(serializers.Serializer):
    """Accepts an email to resend the verification link."""
    email = serializers.EmailField(help_text='Email address to resend verification to.')


# ─────────────────────────────────────────────────────────────────────────────
# Password Management
# ─────────────────────────────────────────────────────────────────────────────

class PasswordResetRequestSerializer(serializers.Serializer):
    """Accepts an email address to send a password reset link."""
    email = serializers.EmailField(help_text='Registered email address.')


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Validates the reset token and new password."""
    token = serializers.CharField(help_text='Signed token received in the reset email.')
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'},
        help_text='New password (min 8 characters).'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs: dict) -> dict:
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Authenticated password change — requires current password."""
    old_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='Current account password.'
    )
    new_password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'},
        help_text='New password (min 8 characters).'
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs: dict) -> dict:
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        try:
            validate_password(attrs['new_password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        return attrs


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth
# ─────────────────────────────────────────────────────────────────────────────

class GoogleOAuthSerializer(serializers.Serializer):
    """Accepts Google ID token from the frontend after Google Sign-In."""
    id_token = serializers.CharField(
        help_text='Google ID token obtained from the Google Sign-In flow on the frontend.'
    )
