"""
ManMitra — Mood Log Model
Daily emotional check-ins with labels, scores, and AI-generated insights.
"""
import uuid
from datetime import date
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class MoodLog(models.Model):
    """
    A single mood check-in entry by the user.
    Tracks both a numeric score (1-10) and a qualitative label.
    The `date` field enables one-per-day enforcement and date-based filtering.
    """

    class MoodLabel(models.TextChoices):
        HAPPY = 'happy', 'Happy'
        SAD = 'sad', 'Sad'
        ANXIOUS = 'anxious', 'Anxious'
        CALM = 'calm', 'Calm'
        ANGRY = 'angry', 'Angry'
        NEUTRAL = 'neutral', 'Neutral'
        EXCITED = 'excited', 'Excited'
        TIRED = 'tired', 'Tired'
        GRATEFUL = 'grateful', 'Grateful'
        OVERWHELMED = 'overwhelmed', 'Overwhelmed'
        HOPEFUL = 'hopeful', 'Hopeful'
        FRUSTRATED = 'frustrated', 'Frustrated'

    # ── Identity ────────────────────────────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mood_logs',
        db_index=True,
    )

    # ── Mood Data ────────────────────────────────────────────────────────────
    mood_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Numeric mood intensity: 1 (very low) to 10 (very high).',
    )
    mood_label = models.CharField(
        max_length=20,
        choices=MoodLabel.choices,
        help_text='Qualitative emotion label.',
    )
    note = models.TextField(
        blank=True,
        default='',
        help_text='Optional free-text note from the user about their mood.',
    )

    # ── AI ───────────────────────────────────────────────────────────────────
    ai_insight = models.TextField(
        blank=True,
        default='',
        help_text='AI-generated empathetic reflection (populated in Phase 3).',
    )

    # ── Timestamps ───────────────────────────────────────────────────────────
    date = models.DateField(
        default=date.today,
        db_index=True,
        help_text='The calendar date of the check-in (for streak/daily aggregations).',
    )
    logged_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Exact timestamp of the check-in.',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Mood Log'
        verbose_name_plural = 'Mood Logs'
        ordering = ['-logged_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'logged_at']),
        ]

    def __str__(self) -> str:
        return f'{self.user.full_name} — {self.mood_label} ({self.mood_score}/10) on {self.date}'

    @property
    def mood_emoji(self) -> str:
        """Returns a display emoji for the mood label."""
        emoji_map = {
            'happy': '😊', 'sad': '😢', 'anxious': '😰', 'calm': '😌',
            'angry': '😠', 'neutral': '😐', 'excited': '🤩', 'tired': '😴',
            'grateful': '🙏', 'overwhelmed': '😵', 'hopeful': '🌟', 'frustrated': '😤',
        }
        return emoji_map.get(self.mood_label, '💭')
