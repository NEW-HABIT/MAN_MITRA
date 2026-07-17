"""
ManMitra — Crisis Incident Reports model
Logs detected mental health crisis incidents for admin and clinical tracking.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.chat.models import ChatSession

User = get_user_model()


class CrisisReport(models.Model):
    """
    Log of crisis triggers detected by the platform (heuristics or LLM flags).
    Allows administrators to monitor critical system events.
    """
    class Severity(models.TextChoices):
        LOW = 'low', 'Low Risk'
        MEDIUM = 'medium', 'Medium Risk'
        HIGH = 'high', 'High Risk'
        CRITICAL = 'critical', 'Critical / Immediate Danger'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='crisis_reports',
        db_index=True
    )
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='crisis_reports'
    )
    
    # ── Crisis Metadata ──────────────────────────────────────────────────────
    trigger_keywords = models.JSONField(
        default=list,
        blank=True,
        help_text='List of exact keywords/phrases that triggered the event.'
    )
    severity = models.CharField(
        max_length=15,
        choices=Severity.choices,
        default=Severity.HIGH
    )
    resources_shown = models.JSONField(
        default=dict,
        blank=True,
        help_text='JSON record of help hotlines and info shown to the user.'
    )

    # ── Status ───────────────────────────────────────────────────────────────
    resolved = models.BooleanField(
        default=False,
        db_index=True,
        help_text='True if support staff marked the incident as reviewed/resolved.'
    )
    
    flagged_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Crisis Report'
        verbose_name_plural = 'Crisis Reports'
        ordering = ['-flagged_at']

    def __str__(self) -> str:
        return f"CrisisReport({self.user.email}) - {self.severity} on {self.flagged_at.date()}"
