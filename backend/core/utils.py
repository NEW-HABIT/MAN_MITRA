"""
ManMitra — Core Utilities
Shared helper functions used across the entire application.
"""
import logging
from django.core.signing import TimestampSigner
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# JWT Token Helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_tokens_for_user(user) -> dict:
    """
    Generate JWT access and refresh tokens for a given user.
    Returns a dict with 'access' and 'refresh' keys.
    """
    refresh = RefreshToken.for_user(user)
    # Embed role and verified status in the token payload for frontend use
    refresh['role'] = user.role
    refresh['is_verified'] = user.is_verified
    refresh['full_name'] = user.full_name
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Email Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _build_signed_token(email: str) -> str:
    """Generate a signed, time-limited token encoding the given email."""
    signer = TimestampSigner()
    return signer.sign(email)


def send_verification_email(user, request=None) -> None:
    """
    Send the email verification link to the newly registered user.
    Token expires in 24 hours (enforced in VerifyEmailView).
    """
    token = _build_signed_token(user.email)
    verification_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={token}"

    subject = '✨ Verify Your ManMitra Account'
    text_body = f"""
Hi {user.get_short_name()},

Welcome to ManMitra — Your AI Companion for Mental Wellness! 🧠💚

Please verify your email address by clicking the link below:
{verification_url}

This link is valid for 24 hours.

If you did not create a ManMitra account, please ignore this email.

With care,
The ManMitra Team
    """.strip()

    # Send plain-text email (HTML template can be added later)
    try:
        send_mail(
            subject=subject,
            message=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f'Verification email sent to: {user.email}')
    except Exception as e:
        logger.error(f'Failed to send verification email to {user.email}: {e}')
        raise


def send_password_reset_email(user, request=None) -> None:
    """
    Send the password reset link to the user.
    Token expires in 1 hour (enforced in PasswordResetConfirmView).
    """
    token = _build_signed_token(user.email)
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"

    subject = '🔐 Reset Your ManMitra Password'
    text_body = f"""
Hi {user.get_short_name()},

We received a request to reset the password for your ManMitra account.

Click the link below to set a new password:
{reset_url}

This link is valid for 1 hour.

If you did not request a password reset, please ignore this email — your password remains unchanged.

With care,
The ManMitra Team
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f'Password reset email sent to: {user.email}')
    except Exception as e:
        logger.error(f'Failed to send password reset email to {user.email}: {e}')
        raise
