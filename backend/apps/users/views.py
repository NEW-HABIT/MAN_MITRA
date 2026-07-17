"""
ManMitra — Authentication & Profile Views
All REST endpoints for auth, profile, and onboarding.
"""
import logging
from typing import Any

from django.contrib.auth import authenticate, get_user_model
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import (
    extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter
)

from .models import WellnessProfile
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    WellnessProfileSerializer,
    LoginSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
    GoogleOAuthSerializer,
)
from core.utils import get_tokens_for_user, send_verification_email, send_password_reset_email
from core.permissions import IsVerifiedUser

User = get_user_model()
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Create a new user account and send email verification link.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        tags=['Authentication'],
        summary='Register a new user',
        request=UserRegistrationSerializer,
        responses={
            201: OpenApiResponse(description='User created. Verification email sent.'),
            400: OpenApiResponse(description='Validation errors.'),
        },
        examples=[
            OpenApiExample(
                'Registration Example',
                value={
                    'email': 'user@example.com',
                    'full_name': 'Arjun Sharma',
                    'password': 'SecurePass123!',
                    'password_confirm': 'SecurePass123!',
                },
                request_only=True,
            )
        ]
    )
    def post(self, request: Request) -> Response:
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            send_verification_email(user, request)
        except Exception as e:
            logger.error(f'Failed to send verification email to {user.email}: {e}')

        logger.info(f'New user registered: {user.email}')
        return Response(
            {
                'message': 'Registration successful! Please check your email to verify your account.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Login / Logout
# ─────────────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticate user credentials and return JWT access + refresh tokens.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        tags=['Authentication'],
        summary='Login with email and password',
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description='JWT tokens + user profile.'),
            401: OpenApiResponse(description='Invalid credentials.'),
            403: OpenApiResponse(description='Email not verified.'),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'error': 'This account has been deactivated. Please contact support.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_verified:
            return Response(
                {
                    'error': 'Email not verified. Please verify your email before logging in.',
                    'action': 'resend_verification',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = get_tokens_for_user(user)
        logger.info(f'User logged in: {user.email}')

        return Response(
            {
                'tokens': tokens,
                'user': UserProfileSerializer(user, context={'request': request}).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token to invalidate the session.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary='Logout — blacklist refresh token',
        request={'application/json': {'type': 'object', 'properties': {'refresh': {'type': 'string'}}}},
        responses={205: OpenApiResponse(description='Logged out successfully.')},
    )
    def post(self, request: Request) -> Response:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f'User logged out: {request.user.email}')
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except TokenError:
            return Response(
                {'error': 'Invalid or already expired refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ─────────────────────────────────────────────────────────────────────────────
# Email Verification
# ─────────────────────────────────────────────────────────────────────────────

class VerifyEmailView(APIView):
    """
    POST /api/auth/verify-email/
    Validates the signed email token sent during registration.
    On success, marks the user as verified and returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Verify email with signed token',
        request=EmailVerificationSerializer,
        responses={
            200: OpenApiResponse(description='Email verified. JWT tokens returned.'),
            400: OpenApiResponse(description='Invalid or expired token.'),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        signer = TimestampSigner()
        try:
            # Token expires in 24 hours (86400 seconds)
            email = signer.unsign(
                serializer.validated_data['token'],
                max_age=86400,
            )
            user = User.objects.get(email=email)

            if user.is_verified:
                return Response(
                    {'message': 'Email is already verified. You can log in.'},
                    status=status.HTTP_200_OK,
                )

            user.is_verified = True
            user.save(update_fields=['is_verified'])

            tokens = get_tokens_for_user(user)
            logger.info(f'Email verified: {user.email}')

            return Response(
                {
                    'message': 'Email verified successfully! Welcome to ManMitra.',
                    'tokens': tokens,
                    'user': UserProfileSerializer(user, context={'request': request}).data,
                },
                status=status.HTTP_200_OK,
            )

        except SignatureExpired:
            return Response(
                {
                    'error': 'Verification link has expired. Please request a new one.',
                    'action': 'resend_verification',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (BadSignature, User.DoesNotExist):
            return Response(
                {'error': 'Invalid verification link. Please check your email or request a new link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ResendVerificationView(APIView):
    """
    POST /api/auth/resend-verification/
    Resends the verification email to an unverified address.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        tags=['Authentication'],
        summary='Resend email verification link',
        request=ResendVerificationSerializer,
        responses={200: OpenApiResponse(description='Verification email sent (if account exists).')},
    )
    def post(self, request: Request) -> Response:
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()

        try:
            user = User.objects.get(email=email)
            if not user.is_verified:
                send_verification_email(user, request)
        except User.DoesNotExist:
            pass  # Do not leak whether the email exists

        # Always return 200 to prevent email enumeration attacks
        return Response(
            {'message': 'If that email is registered and unverified, a new verification link has been sent.'},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Password Management
# ─────────────────────────────────────────────────────────────────────────────

class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password/reset/
    Sends a password reset link to the provided email address.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        tags=['Authentication'],
        summary='Request password reset email',
        request=PasswordResetRequestSerializer,
        responses={200: OpenApiResponse(description='Reset email sent (if account exists).')},
    )
    def post(self, request: Request) -> Response:
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()

        try:
            user = User.objects.get(email=email)
            send_password_reset_email(user, request)
        except User.DoesNotExist:
            pass  # Prevent email enumeration

        return Response(
            {'message': 'If that email is registered, a password reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password/reset/confirm/
    Validates reset token and sets the new password.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Confirm password reset',
        request=PasswordResetConfirmSerializer,
        responses={
            200: OpenApiResponse(description='Password reset successfully.'),
            400: OpenApiResponse(description='Invalid or expired token.'),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        signer = TimestampSigner()
        try:
            # Reset links expire in 1 hour (3600 seconds)
            email = signer.unsign(
                serializer.validated_data['token'],
                max_age=3600,
            )
            user = User.objects.get(email=email)
            user.set_password(serializer.validated_data['password'])
            user.save(update_fields=['password'])

            logger.info(f'Password reset completed for: {user.email}')
            return Response(
                {'message': 'Password has been reset successfully. You can now log in.'},
                status=status.HTTP_200_OK,
            )

        except SignatureExpired:
            return Response(
                {'error': 'Password reset link has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (BadSignature, User.DoesNotExist):
            return Response(
                {'error': 'Invalid reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ChangePasswordView(APIView):
    """
    POST /api/auth/password/change/
    Allows an authenticated user to change their current password.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary='Change password (authenticated)',
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description='Password changed successfully.'),
            400: OpenApiResponse(description='Incorrect current password or validation error.'),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        logger.info(f'Password changed for: {user.email}')
        return Response(
            {'message': 'Password changed successfully. Please log in again with your new password.'},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Profile (Me)
# ─────────────────────────────────────────────────────────────────────────────

class MeView(APIView):
    """
    GET  /api/auth/me/ — Retrieve current user profile.
    PATCH /api/auth/me/ — Update user profile fields.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Profile'],
        summary='Get current user profile',
        responses={200: UserProfileSerializer},
    )
    def get(self, request: Request) -> Response:
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Profile'],
        summary='Update user profile',
        request=UserProfileUpdateSerializer,
        responses={200: UserProfileSerializer},
    )
    def patch(self, request: Request) -> Response:
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return the full profile after update
        return Response(
            UserProfileSerializer(request.user, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class WellnessProfileView(APIView):
    """
    GET   /api/auth/me/wellness/ — Get wellness/onboarding data.
    PATCH /api/auth/me/wellness/ — Update wellness profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_profile(self, user) -> WellnessProfile:
        profile, _ = WellnessProfile.objects.get_or_create(user=user)
        return profile

    @extend_schema(
        tags=['Profile'],
        summary='Get wellness profile (onboarding data)',
        responses={200: WellnessProfileSerializer},
    )
    def get(self, request: Request) -> Response:
        profile = self._get_profile(request.user)
        serializer = WellnessProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Profile'],
        summary='Update wellness profile',
        request=WellnessProfileSerializer,
        responses={200: WellnessProfileSerializer},
    )
    def patch(self, request: Request) -> Response:
        profile = self._get_profile(request.user)
        serializer = WellnessProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth
# ─────────────────────────────────────────────────────────────────────────────

class GoogleOAuthView(APIView):
    """
    POST /api/auth/google/
    Exchange a Google ID token (from frontend) for ManMitra JWT tokens.
    The frontend completes the Google Sign-In flow and sends us the id_token.
    We verify it, create or retrieve the user, and return our own JWTs.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        tags=['Authentication'],
        summary='Login / Register with Google',
        request=GoogleOAuthSerializer,
        responses={
            200: OpenApiResponse(description='JWT tokens + user profile.'),
            400: OpenApiResponse(description='Invalid Google token.'),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = GoogleOAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token_str = serializer.validated_data['id_token']

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            google_client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            id_info = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                google_client_id,
            )

            email = id_info.get('email', '').lower()
            full_name = id_info.get('name', '')
            # avatar_url = id_info.get('picture', '')  # Future: download and store

            if not email:
                return Response(
                    {'error': 'Google account does not have an email address.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get or create the user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': full_name,
                    'is_verified': True,   # Google already verified the email
                    'is_active': True,
                },
            )

            if not created and not user.is_verified:
                user.is_verified = True
                user.save(update_fields=['is_verified'])

            # Ensure wellness profile exists
            WellnessProfile.objects.get_or_create(user=user)

            tokens = get_tokens_for_user(user)
            action = 'registered' if created else 'logged_in'
            logger.info(f'Google OAuth {action}: {user.email}')

            return Response(
                {
                    'tokens': tokens,
                    'user': UserProfileSerializer(user, context={'request': request}).data,
                    'is_new_user': created,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            logger.warning(f'Invalid Google token: {e}')
            return Response(
                {'error': 'Invalid or expired Google token. Please try signing in again.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ImportError:
            return Response(
                {'error': 'Google Auth library not installed. Run: pip install google-auth'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ─────────────────────────────────────────────────────────────────────────────
# Admin Anonymized Analytics Dashboard (Phase 4)
# ─────────────────────────────────────────────────────────────────────────────

class AdminDashboardView(APIView):
    """
    GET /api/auth/admin/dashboard/
    Fetch global, anonymized dashboard analytics for administrators.
    Provides counts, average stress levels, and crisis reports metrics.
    """
    from core.permissions import IsAdminRole
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    @extend_schema(
        tags=['Admin Panel'],
        summary='Get global anonymized system analytics (Admin only)',
        responses={
            200: OpenApiResponse(
                description='Anonymized stats returned.',
                examples=[
                    OpenApiExample(
                        'Dashboard Metrics',
                        value={
                            'total_users': 150,
                            'total_therapists': 12,
                            'total_admins': 3,
                            'avg_stress_level': 5.2,
                            'total_mood_logs': 450,
                            'total_journal_entries': 310,
                            'total_crisis_incidents': 5,
                            'crisis_resolution_rate': 80.0,
                        }
                    )
                ]
            )
        }
    )
    def get(self, request: Request) -> Response:
        from django.db.models import Avg, Count
        from apps.users.models import User, WellnessProfile
        from apps.mood.models import MoodLog
        from apps.journal.models import JournalEntry
        from apps.emergency.models import CrisisReport

        # User counts
        total_users = User.objects.filter(role=User.Role.USER).count()
        total_therapists = User.objects.filter(role=User.Role.THERAPIST).count()
        total_admins = User.objects.filter(role=User.Role.ADMIN).count()

        # Wellness stats
        avg_stress = WellnessProfile.objects.aggregate(Avg('stress_level'))['stress_level__avg']

        # Mood & Journal activity counts
        total_moods = MoodLog.objects.count()
        total_journals = JournalEntry.objects.count()

        # Crisis metrics
        total_crisis = CrisisReport.objects.count()
        resolved_crisis = CrisisReport.objects.filter(resolved=True).count()
        resolution_rate = 0.0
        if total_crisis > 0:
            resolution_rate = round((resolved_crisis / total_crisis) * 100, 2)

        return Response(
            {
                'total_users': total_users,
                'total_therapists': total_therapists,
                'total_admins': total_admins,
                'avg_stress_level': round(avg_stress, 2) if avg_stress else 0.0,
                'total_mood_logs': total_moods,
                'total_journal_entries': total_journals,
                'total_crisis_incidents': total_crisis,
                'crisis_resolution_rate': resolution_rate,
            },
            status=status.HTTP_200_OK
        )

