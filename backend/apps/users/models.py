"""
ManMitra — User & Wellness Profile Models
Core identity layer for the entire platform.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from .managers import UserManager


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
