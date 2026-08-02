"""
ManMitra — User & Wellness Profile Models
Core identity layer for the entire platform.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from .managers import UserManager



class EmailOTP(models.Model):
    """
    Stores 6-digit Email Verification OTPs for user registration.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"OTP {self.otp_code} for {self.email}"



class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model — email-based authentication.
    UUID primary key for privacy and security.
    Role-based access control built-in.
    """

    class Role(models.TextChoices):
        USER = 'user', 'User'
        THERAPIST = 'therapist', 'Therapist'
        ADMIN = 'admin', 'Admin'

    class Gender(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'
        NON_BINARY = 'NB', 'Non-Binary'
        PREFER_NOT_TO_SAY = 'PNS', 'Prefer Not to Say'

    # ── Identity ─────────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    avatar = models.ImageField(
        upload_to='avatars/%Y/%m/',
        null=True, blank=True,
        help_text='Profile picture'
    )

    # ── Demographics (collected during onboarding) ───────
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=5,
        choices=Gender.choices,
        blank=True,
        default=''
    )
    occupation = models.CharField(max_length=255, blank=True, default='')
    consultation_fee = models.CharField(max_length=100, blank=True, default='₹1,500 / 45 mins')

    # ── Platform Role ─────────────────────────────────────
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
        db_index=True
    )

    # ── Status Flags ──────────────────────────────────────
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(
        default=False,
        help_text='True after email verification is completed.'
    )

    # ── Timestamps ────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ── Auth Config ───────────────────────────────────────
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.full_name} <{self.email}>'

    def __repr__(self) -> str:
        return f'<User id={self.id} email={self.email} role={self.role}>'

    # ── Role Helpers ──────────────────────────────────────
    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_therapist_role(self) -> bool:
        return self.role == self.Role.THERAPIST

    @property
    def is_regular_user(self) -> bool:
        return self.role == self.Role.USER

    def get_full_name(self) -> str:
        return self.full_name

    def get_short_name(self) -> str:
        return self.full_name.split()[0] if self.full_name else self.email


class WellnessProfile(models.Model):
    """
    Extended wellness data collected during onboarding.
    OneToOne with User — created automatically on user registration.
    Stores structured JSON data for goals and preferences.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='wellness_profile'
    )

    # ── Sleep ─────────────────────────────────────────────
    sleep_schedule = models.JSONField(
        default=dict,
        blank=True,
        help_text='e.g. {"bedtime": "22:30", "wake_time": "06:30"}'
    )

    # ── Stress ────────────────────────────────────────────
    stress_level = models.PositiveSmallIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Self-reported stress level 1 (low) – 10 (high)'
    )

    # ── Goals & Preferences ───────────────────────────────
    primary_goals = models.JSONField(
        default=list,
        blank=True,
        help_text='e.g. ["reduce anxiety", "better sleep", "build confidence"]'
    )
    wellness_preferences = models.JSONField(
        default=list,
        blank=True,
        help_text='e.g. ["breathing exercises", "journaling", "meditation"]'
    )

    # ── Onboarding State ──────────────────────────────────
    onboarding_done = models.BooleanField(
        default=False,
        help_text='True once user completes the onboarding wizard.'
    )

    # ── Timestamps ────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Wellness Profile'
        verbose_name_plural = 'Wellness Profiles'

    def __str__(self) -> str:
        return f'WellnessProfile({self.user.email})'


class Appointment(models.Model):
    """
    Routine consultation booking schedule between Client and Doctor.
    """
    class Status(models.TextChoices):
        UPCOMING = 'Upcoming', 'Upcoming'
        COMPLETED = 'Completed', 'Completed'
        SCHEDULED = 'Scheduled', 'Scheduled'
        CANCELLED = 'Cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_appointments')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_appointments')
    time_slot = models.CharField(max_length=100, help_text='e.g. 09:00 AM - 09:45 AM')
    session_type = models.CharField(max_length=255, default='Cognitive Behavioral Therapy (CBT)')
    meeting_type = models.CharField(max_length=100, default='Online Video Call')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'time_slot']

    def __str__(self) -> str:
        return f'{self.doctor.full_name} with {self.client.full_name} ({self.time_slot})'


class DoctorCareNote(models.Model):
    """
    Clinical progress observations recorded by Doctor for a specific Client.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recorded_notes')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clinical_notes')
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'Note for {self.client.full_name} by {self.doctor.full_name}'


class AssessmentSubmission(models.Model):
    """
    Standardized PHQ-9, GAD-7, Stress, and Sleep clinical assessment submissions.
    """
    class Type(models.TextChoices):
        PHQ9 = 'PHQ9', 'PHQ-9 Depression'
        GAD7 = 'GAD7', 'GAD-7 Anxiety'
        STRESS = 'STRESS', 'Stress Assessment'
        SLEEP = 'SLEEP', 'Sleep Assessment'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_submissions')
    assessment_type = models.CharField(max_length=20, choices=Type.choices)
    score = models.IntegerField()
    max_score = models.IntegerField(default=27)
    severity_level = models.CharField(max_length=50) # e.g. 'Minimal', 'Mild', 'Moderate', 'Severe'
    answers = models.JSONField(default=dict)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.user.full_name} - {self.assessment_type} ({self.score})'


class TreatmentPlan(models.Model):
    """
    Clinical treatment plan created by Doctor for a Client.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_treatment_plans')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_treatment_plans')
    title = models.CharField(max_length=255, default='Personalized CBT & Mindfulness Plan')
    diagnosis = models.CharField(max_length=255, blank=True, default='')
    primary_goals = models.JSONField(default=list)
    assigned_exercises = models.JSONField(default=list)
    prescribed_medications = models.JSONField(default=list)
    cbt_activities = models.JSONField(default=list)
    status = models.CharField(max_length=20, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'Treatment Plan for {self.client.full_name} by {self.doctor.full_name}'


class CommunityPost(models.Model):
    """
    Peer support community discussion post.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_posts')
    author_name_alias = models.CharField(max_length=100, default='Anonymous Peer')
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, default='General Discussion')
    is_anonymous = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    is_reported = models.BooleanField(default=False)
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'Post "{self.title}" by {self.author_name_alias}'


class CommunityComment(models.Model):
    """
    Comment on a peer support community post.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_comments')
    author_name_alias = models.CharField(max_length=100, default='Anonymous Peer')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class PlatformNotification(models.Model):
    """
    Platform-wide broadcast and user-specific notifications.
    """
    class Type(models.TextChoices):
        ANNOUNCEMENT = 'Announcement', 'Platform Announcement'
        REMINDER = 'Reminder', 'Health Reminder'
        PROMO = 'Promotional', 'Promotional Message'
        MAINTENANCE = 'Maintenance', 'Maintenance Notification'
        EMERGENCY = 'Emergency', 'Emergency Alert'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='received_notifications')
    notification_type = models.CharField(max_length=30, choices=Type.choices, default=Type.ANNOUNCEMENT)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_global = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class WellnessResource(models.Model):
    """
    Psychoeducational resource content (articles, meditations, exercises, videos, FAQs).
    """
    class Category(models.TextChoices):
        ARTICLE = 'Article', 'Article'
        MEDITATION = 'Meditation', 'Guided Meditation'
        EXERCISE = 'Exercise', 'CBT Exercise'
        VIDEO = 'Video', 'Wellness Video'
        SLEEP = 'Sleep', 'Sleep Audio'
        FAQ = 'FAQ', 'Frequently Asked Question'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.ARTICLE)
    summary = models.TextField()
    content_body = models.TextField(blank=True, default='')
    duration_mins = models.PositiveIntegerField(default=10)
    resource_url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class SubscriptionPlan(models.Model):
    """
    Platform subscription tiers.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100) # e.g. 'Free Care', 'Plus Support', 'Premium Clinical'
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f'{self.name} - ₹{self.price_monthly}/mo'


class RefundRequest(models.Model):
    """
    Refund requests submitted by clients or processed by admins.
    """
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending Review'
        APPROVED = 'Approved', 'Approved & Refunded'
        REJECTED = 'Rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refund_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

