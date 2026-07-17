"""
ManMitra — Journal Entry Model
Encrypted journal entries for privacy with sentiment score and optional mood log linking.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.mood.models import MoodLog
from core.cryptography import encrypt_text, decrypt_text

User = get_user_model()


class JournalEntry(models.Model):
    """
    A private diary/journal entry by the user.
    Content is encrypted at rest using Fernet encryption.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='journal_entries',
        db_index=True,
    )

    title = models.CharField(max_length=255, blank=True, default='Untitled Entry')
    
    # ── Encryption at rest ──────────────────────────────────────────────────
    # The actual database field stores the encrypted base64 payload.
    _encrypted_content = models.TextField(
        db_column='content',
        help_text='Encrypted journal content stored at rest.',
    )

    # ── Mood & Sentiment ─────────────────────────────────────────────────────
    mood_tag = models.ForeignKey(
        MoodLog,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='linked_journals',
        help_text='Optional link to a mood log logged around the same time.',
    )
    sentiment_score = models.FloatField(
        default=0.0,
        help_text='AI-analyzed sentiment score between -1.0 (very negative) and 1.0 (very positive).',
    )

    # ── Timestamps ───────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self) -> str:
        return f'{self.title} by {self.user.full_name} on {self.created_at.date()}'

    # ── Property for content encryption/decryption ──────────────────────────
    @property
    def content(self) -> str:
        """Decrypts and returns the entry content."""
        return decrypt_text(self._encrypted_content)

    @content.setter
    def content(self, value: str) -> None:
        """Encrypts and sets the entry content."""
        self._encrypted_content = encrypt_text(value)
