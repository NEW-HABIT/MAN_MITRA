"""
ManMitra — Users App URL Configuration
All authentication and profile endpoints under /api/auth/
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    SendEmailOTPView,
    VerifyEmailOTPView,
    VerifyEmailView,
    ResendVerificationView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ChangePasswordView,
    MeView,
    WellnessProfileView,
    GoogleOAuthView,
    AdminDashboardView,
    AdminDoctorCreateView,
    AdminClientCreateView,
    AdminMemberCreateView,
    AdminUserUpdateView,
    AdminAssignPatientView,
    TherapistPatientsView,
    TherapistScheduleView,
    PublicDoctorListView,
    AssessmentSubmissionView,
    TreatmentPlanView,
    CommunityPostView,
    CommunityCommentView,
    CommunityPostLikeView,
    PlatformNotificationView,
    WellnessResourceView,
    ClientAnalysisView,
)

app_name = 'users'

# Extend the simplejwt TokenRefreshView with docs
TokenRefreshView = extend_schema(
    tags=['Authentication'],
    summary='Refresh access token',
)(TokenRefreshView)

urlpatterns = [
    # ── OTP & Registration Flow ──────────────────────────────────────────────
    path('send-otp/', SendEmailOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyEmailOTPView.as_view(), name='verify-otp'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),


    # ── Email Verification ───────────────────────────────────────────────────
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),

    # ── Password Management ──────────────────────────────────────────────────
    path('password/reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),

    # ── Profile ──────────────────────────────────────────────────────────────
    path('me/', MeView.as_view(), name='me'),
    path('me/wellness/', WellnessProfileView.as_view(), name='wellness-profile'),

    # ── Social Auth ──────────────────────────────────────────────────────────
    path('google/', GoogleOAuthView.as_view(), name='google-oauth'),

    # ── Specialist / Therapist Portal ───────────────────────────────────────
    path('doctors/public/', PublicDoctorListView.as_view(), name='doctors-public'),
    path('therapist/patients/', TherapistPatientsView.as_view(), name='therapist-patients'),
    path('therapist/patients/<uuid:client_id>/analysis/', ClientAnalysisView.as_view(), name='client-analysis'),
    path('therapist/schedule/', TherapistScheduleView.as_view(), name='therapist-schedule'),
    path('treatment-plans/', TreatmentPlanView.as_view(), name='treatment-plans'),

    # ── Clinical Assessments ─────────────────────────────────────────────────
    path('assessments/', AssessmentSubmissionView.as_view(), name='assessments'),

    # ── Community Forum ──────────────────────────────────────────────────────
    path('community/posts/', CommunityPostView.as_view(), name='community-posts'),
    path('community/posts/<uuid:post_id>/like/', CommunityPostLikeView.as_view(), name='community-post-like'),
    path('community/comments/', CommunityCommentView.as_view(), name='community-comments'),


    # ── Notifications & Resources ────────────────────────────────────────────
    path('notifications/', PlatformNotificationView.as_view(), name='notifications'),
    path('resources/', WellnessResourceView.as_view(), name='resources'),

    # ── Admin Panel ──────────────────────────────────────────────────────────
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/doctors/', AdminDoctorCreateView.as_view(), name='admin-doctor-create'),
    path('admin/clients/', AdminClientCreateView.as_view(), name='admin-client-create'),
    path('admin/members/', AdminMemberCreateView.as_view(), name='admin-member-create'),
    path('admin/users/<uuid:user_id>/', AdminUserUpdateView.as_view(), name='admin-user-update'),
    path('admin/assign-patient/', AdminAssignPatientView.as_view(), name='admin-assign-patient'),
]

