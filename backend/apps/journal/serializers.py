"""
ManMitra — Journal Entry Serializers
Handles serialization, validation, and transparent decryption of journal entries.
"""
from rest_framework import serializers
from .models import JournalEntry
from apps.mood.models import MoodLog
from apps.mood.serializers import MoodLogSerializer


class JournalEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for listing and CRUD operations on Journal Entries.
    Exposes the plain-text `content` property transparently.
    """
    content = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Plain text content of the journal entry (will be encrypted at rest)."
    )
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    mood_tag_detail = MoodLogSerializer(source='mood_tag', read_only=True)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'user', 'title', 'content', 'mood_tag', 'mood_tag_detail',
            'sentiment_score', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'sentiment_score', 'created_at', 'updated_at']

    def create(self, validated_data: dict) -> JournalEntry:
        content = validated_data.pop('content', '')
        # Instantiate model instance
        entry = JournalEntry(**validated_data)
        # Use property setter to encrypt content
        entry.content = content
        entry.save()
        return entry

    def update(self, instance: JournalEntry, validated_data: dict) -> JournalEntry:
        if 'content' in validated_data:
            instance.content = validated_data.pop('content')
        return super().update(instance, validated_data)


class JournalEntryDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for returning journal entries (reads the decrypted content).
    """
    content = serializers.SerializerMethodField(help_text="Decrypted plain text content.")
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    mood_tag_detail = MoodLogSerializer(source='mood_tag', read_only=True)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'user', 'title', 'content', 'mood_tag', 'mood_tag_detail',
            'sentiment_score', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'sentiment_score', 'created_at', 'updated_at']

    def get_content(self, obj: JournalEntry) -> str:
        return obj.content
