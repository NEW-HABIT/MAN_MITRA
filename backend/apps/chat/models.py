"""
ManMitra — Chat models
Tracks user AI chat sessions and individual chat messages.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatSession(models.Model):
    """
    A single chat conversation session between a user and the ManMitra AI.
    Allows groupings of message streams and crisis flagging per conversation context.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_sessions',
        db_index=True
    )
    title = models.CharField(
        max_length=255,
        default='New Conversation',
        help_text='Auto-generated or user-defined title for the session.'
    )
    is_crisis = models.BooleanField(
        default=False,
        help_text='Flagged True if a crisis/self-harm was detected inside this conversation.'
    )
    
    started_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Null if session is active; timestamp if user closed or archived it.'
    )

    class Meta:
        verbose_name = 'Chat Session'
        verbose_name_plural = 'Chat Sessions'
        ordering = ['-started_at']

    def __str__(self) -> str:
        return f"ChatSession {self.title} ({self.user.email})"


class ChatMessage(models.Model):
    """
    An individual message within a ChatSession.
    Identifies if message is user instruction, system context, or AI assistant output.
    """
    class Role(models.TextChoices):
        USER = 'user', 'User'
        ASSISTANT = 'assistant', 'AI Assistant'
        SYSTEM = 'system', 'System Context'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
        db_index=True
    )
    role = models.CharField(
        max_length=15,
        choices=Role.choices,
        default=Role.USER
    )
    content = models.TextField(help_text='Raw text contents.')
    
    tokens_used = models.PositiveIntegerField(
        default=0,
        help_text='Metadata for token tracking.'
    )
    crisis_flagged = models.BooleanField(
        default=False,
        help_text='True if this specific prompt/response triggered a crisis pattern.'
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ['created_at']

    def __str__(self) -> str:
        return f"{self.role.upper()} in {self.session.id} at {self.created_at}"
